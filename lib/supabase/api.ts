import { createClient } from './client';
import {
  INITIAL_MOCK_CATEGORIES,
  INITIAL_MOCK_PRODUCTS,
  INITIAL_MOCK_ORDERS,
  INITIAL_MOCK_SETTINGS,
} from './mock-data';
import { Category, Product, Order, SiteSettings, OrderStatus } from '@/types/database';

// Local storage keys for local state persistence
const STORAGE_KEYS = {
  CATEGORIES: 'petal_ink_mock_categories',
  PRODUCTS: 'petal_ink_mock_products',
  ORDERS: 'petal_ink_mock_orders',
  SETTINGS: 'petal_ink_mock_settings',
};

// In-memory store fallback to guarantee real-time updates even if browser storage quota is exceeded
const memoryStore = new Map<string, any>();

function getMockData<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') return initialValue;
  try {
    if (memoryStore.has(key)) {
      return memoryStore.get(key) as T;
    }
    const item = window.localStorage.getItem(key);
    if (!item) return initialValue;
    const parsed = JSON.parse(item) as T;
    memoryStore.set(key, parsed);
    return parsed;
  } catch (e) {
    console.error('Error reading localStorage key', key, e);
    return initialValue;
  }
}

function setMockData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  memoryStore.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage notice (persisted to in-memory store):', e);
  }
}

// ----------------------------------------------------
// SITE SETTINGS API
// ----------------------------------------------------
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createClient();
  if (supabase) {
    const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
    if (!error && data) return data as SiteSettings;
  }
  return getMockData(STORAGE_KEYS.SETTINGS, INITIAL_MOCK_SETTINGS);
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const supabase = createClient();
  if (supabase) {
    const current = await getSiteSettings();
    if (current.id) {
      const { data, error } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', current.id)
        .select()
        .single();
      if (!error && data) return data as SiteSettings;
    }
  }

  const currentMock = getMockData(STORAGE_KEYS.SETTINGS, INITIAL_MOCK_SETTINGS);
  const updatedMock = { ...currentMock, ...settings };
  setMockData(STORAGE_KEYS.SETTINGS, updatedMock);
  return updatedMock;
}

// ----------------------------------------------------
// CATEGORIES API
// ----------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  let dbCategories: Category[] = [];

  if (supabase) {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (!error && data) {
      dbCategories = data as Category[];
    }
  }

  const userCategories = getMockData<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_MOCK_CATEGORIES);
  const userMap = new Map(userCategories.map((c) => [c.id || c.slug, c]));

  let finalCategories: Category[] = [];
  const processedKeys = new Set<string>();

  // Process user categories first
  for (const c of userCategories) {
    const key = c.id || c.slug;
    if (processedKeys.has(key)) continue;
    processedKeys.add(key);
    finalCategories.push(c);
  }

  // Merge remaining DB categories if not overridden
  for (const dbC of dbCategories) {
    const key = dbC.id || dbC.slug;
    if (!processedKeys.has(key) && !userMap.has(key)) {
      processedKeys.add(key);
      finalCategories.push(dbC);
    }
  }

  return finalCategories.length > 0 ? finalCategories : INITIAL_MOCK_CATEGORIES;
}

export async function saveCategory(category: Partial<Category>): Promise<Category> {
  const supabase = createClient();
  let resultCategory: Category | null = null;

  if (supabase) {
    if (category.id) {
      const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', category.id)
        .select()
        .single();
      if (!error && data) resultCategory = data as Category;
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: category.name, slug: category.slug, image_url: category.image_url }])
        .select()
        .single();
      if (!error && data) resultCategory = data as Category;
    }
  }

  const categories = getMockData<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_MOCK_CATEGORIES);
  const updatedCategory: Category = {
    id: category.id || resultCategory?.id || `c-mock-${Date.now()}`,
    name: category.name || '',
    slug: category.slug || '',
    image_url: category.image_url || '',
    created_at: category.created_at || new Date().toISOString(),
    ...(resultCategory || {}),
    // Explicit override so user input always wins
    ...(category.image_url !== undefined ? { image_url: category.image_url } : {}),
  };

  const idx = categories.findIndex((c) => c.id === updatedCategory.id || c.slug === updatedCategory.slug);
  if (idx !== -1) {
    categories[idx] = updatedCategory;
  } else {
    categories.unshift(updatedCategory);
  }

  setMockData(STORAGE_KEYS.CATEGORIES, categories);
  return updatedCategory;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = createClient();
  if (supabase) {
    await supabase.from('categories').delete().eq('id', id);
  }

  const categories = getMockData<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_MOCK_CATEGORIES);
  const filtered = categories.filter((c) => c.id !== id && c.slug !== id);
  setMockData(STORAGE_KEYS.CATEGORIES, filtered);
  return true;
}

// ----------------------------------------------------
// PRODUCTS API - CLEAN PURE CRUD (USER EDITS ALWAYS WIN)
// ----------------------------------------------------
export async function getProducts(options?: { activeOnly?: boolean; featuredOnly?: boolean; categorySlug?: string }): Promise<Product[]> {
  const categories = await getCategories();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const supabase = createClient();
  let dbProducts: Product[] = [];

  if (supabase) {
    let query = supabase.from('products').select('*');
    if (options?.activeOnly) {
      query = query.eq('is_active', true);
    }
    if (options?.featuredOnly) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) {
      dbProducts = data as Product[];
    }
  }

  // Load user saved edits from LocalStorage
  const userProducts = getMockData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_MOCK_PRODUCTS);
  const userMap = new Map<string, Product>();
  for (const p of userProducts) {
    if (p.id) userMap.set(p.id, p);
    if (p.slug) userMap.set(p.slug, p);
  }

  let finalProductsList: Product[] = [];
  const processedKeys = new Set<string>();

  // 1. Process local user edits first (User Edits 100% WIN over stale DB records)
  for (const p of userProducts) {
    const key = p.id || p.slug;
    if (!key || processedKeys.has(key)) continue;
    processedKeys.add(key);
    finalProductsList.push(p);
  }

  // 2. Add any remaining DB products that have not been edited locally
  for (const dbP of dbProducts) {
    const key = dbP.id || dbP.slug;
    if (!key || processedKeys.has(key)) continue;
    if (!userMap.has(dbP.id) && !userMap.has(dbP.slug)) {
      processedKeys.add(key);
      finalProductsList.push(dbP);
    }
  }

  if (finalProductsList.length === 0) {
    finalProductsList = INITIAL_MOCK_PRODUCTS;
  }

  // Apply filters
  if (options?.activeOnly) {
    finalProductsList = finalProductsList.filter((p) => p.is_active);
  }
  if (options?.featuredOnly) {
    finalProductsList = finalProductsList.filter((p) => p.is_featured);
  }
  if (options?.categorySlug) {
    const cat = categories.find((c) => c.slug === options.categorySlug);
    if (cat) {
      finalProductsList = finalProductsList.filter((p) => p.category_id === cat.id);
    }
  }

  return finalProductsList.map((p) => ({ ...p, category: categoryMap.get(p.category_id) }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) || null;
}

export async function saveProduct(product: Partial<Product>): Promise<Product> {
  const supabase = createClient();
  let resultProduct: Product | null = null;

  // Clean category_id so invalid mock IDs or empty strings do not trigger Postgres UUID syntax errors
  const validCategoryId = (product.category_id && product.category_id.trim().length > 10 && !product.category_id.startsWith('c-mock-'))
    ? product.category_id
    : null;

  const validSlug = product.slug?.trim() || (product.name ? product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : `product-${Date.now()}`);

  if (supabase) {
    const payload = {
      ...(validCategoryId ? { category_id: validCategoryId } : {}),
      name: product.name || 'Untitled Design',
      slug: validSlug,
      description: product.description || '',
      price: product.price || 0,
      image_urls: product.image_urls || [],
      custom_fields: product.custom_fields || [],
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
    };

    if (product.id && !product.id.startsWith('p-mock-')) {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', product.id)
        .select()
        .single();
      if (!error && data) {
        resultProduct = data as Product;
      } else if (error) {
        console.warn('Supabase DB Product update notice:', error.message);
      }
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();
      if (!error && data) {
        resultProduct = data as Product;
      } else if (error) {
        console.warn('Supabase DB Product insert notice:', error.message);
      }
    }
  }

  const products = getMockData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_MOCK_PRODUCTS);

  // Construct the updated product where user's image_urls explicitly OVERRIDES everything
  const updatedProduct: Product = {
    id: product.id || resultProduct?.id || `p-mock-${Date.now()}`,
    category_id: product.category_id || '',
    name: product.name || '',
    slug: product.slug || '',
    description: product.description || '',
    price: product.price || 0,
    custom_fields: product.custom_fields || [],
    is_active: product.is_active ?? true,
    is_featured: product.is_featured ?? false,
    created_at: product.created_at || new Date().toISOString(),
    ...(resultProduct || {}),
    // CRITICAL FIX: Ensure user's updated image_urls array explicitly overrides any DB fallback!
    image_urls: product.image_urls !== undefined ? product.image_urls : (resultProduct?.image_urls || []),
  };

  const idx = products.findIndex((p) => (product.id && p.id === product.id) || (product.slug && p.slug === product.slug));
  if (idx !== -1) {
    products[idx] = updatedProduct;
  } else {
    products.unshift(updatedProduct);
  }

  setMockData(STORAGE_KEYS.PRODUCTS, products);
  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = createClient();
  if (supabase) {
    await supabase.from('products').delete().eq('id', id);
  }

  const products = getMockData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_MOCK_PRODUCTS);
  const filtered = products.filter((p) => p.id !== id && p.slug !== id);
  setMockData(STORAGE_KEYS.PRODUCTS, filtered);
  return true;
}

export async function toggleProductActive(id: string, is_active: boolean): Promise<boolean> {
  const supabase = createClient();
  if (supabase) {
    await supabase.from('products').update({ is_active }).eq('id', id);
  }

  const products = getMockData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_MOCK_PRODUCTS);
  const idx = products.findIndex((p) => p.id === id);
  if (idx !== -1) {
    products[idx].is_active = is_active;
    setMockData(STORAGE_KEYS.PRODUCTS, products);
  }
  return true;
}

// ----------------------------------------------------
// ORDERS API
// ----------------------------------------------------
export async function createOrder(
  customerDetails: { customer_name: string; phone: string; email?: string | null; notes?: string | null },
  items: { product: Product; quantity: number; customFieldValues: Record<string, string> }[]
): Promise<Order> {
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const supabase = createClient();
  if (supabase) {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: customerDetails.customer_name,
          phone: customerDetails.phone,
          email: customerDetails.email || null,
          notes: customerDetails.notes || null,
          status: 'pending',
          total_price: totalPrice,
        },
      ])
      .select()
      .single();

    if (!orderError && orderData) {
      const orderItemsToInsert = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name_snapshot: item.product.name,
        price_at_purchase: item.product.price,
        quantity: item.quantity,
        custom_field_values: item.customFieldValues,
      }));

      await supabase.from('order_items').insert(orderItemsToInsert);

      return {
        ...orderData,
        order_items: orderItemsToInsert.map((oi, index) => ({
          ...oi,
          id: `item-${index}`,
          created_at: new Date().toISOString(),
          product: items[index].product,
        })),
      };
    }
  }

  const orders = getMockData<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_MOCK_ORDERS);
  const newOrder: Order = {
    id: `ord-mock-${Date.now()}`,
    customer_name: customerDetails.customer_name,
    phone: customerDetails.phone,
    email: customerDetails.email || null,
    notes: customerDetails.notes || null,
    status: 'pending',
    total_price: totalPrice,
    created_at: new Date().toISOString(),
    order_items: items.map((item, idx) => ({
      id: `item-mock-${idx}`,
      order_id: `ord-mock-${Date.now()}`,
      product_id: item.product.id,
      product_name_snapshot: item.product.name,
      price_at_purchase: item.product.price,
      quantity: item.quantity,
      custom_field_values: item.customFieldValues,
      created_at: new Date().toISOString(),
      product: item.product,
    })),
  };

  orders.unshift(newOrder);
  setMockData(STORAGE_KEYS.ORDERS, orders);
  return newOrder;
}

export async function getOrders(): Promise<Order[]> {
  const supabase = createClient();
  if (supabase) {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(*))')
      .order('created_at', { ascending: false });

    if (!error && orders) {
      return orders as Order[];
    }
  }

  return getMockData(STORAGE_KEYS.ORDERS, INITIAL_MOCK_ORDERS);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const supabase = createClient();
  if (supabase) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (!error) return true;
  }

  const orders = getMockData(STORAGE_KEYS.ORDERS, INITIAL_MOCK_ORDERS);
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    setMockData(STORAGE_KEYS.ORDERS, orders);
  }
  return true;
}
