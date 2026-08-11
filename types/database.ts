export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  created_at?: string;
}

export interface CustomField {
  name: string;
  type: 'text';
  required: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // In whole PKR
  image_urls: string[];
  custom_fields: CustomField[];
  is_active: boolean;
  is_featured: boolean;
  created_at?: string;
  category?: Category;
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'delivered';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name_snapshot: string;
  price_at_purchase: number;
  quantity: number;
  custom_field_values: Record<string, string>;
  created_at?: string;
  product?: Product;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  order_items?: OrderItem[];
}

export interface SiteSettings {
  id?: string;
  contact_email: string;
  brand_name: string;
  tagline: string;
  logo_url: string;
}

export interface CartItem {
  id: string; // unique cart item id (product_id + stringified custom fields)
  product: Product;
  quantity: number;
  customFieldValues: Record<string, string>;
}
