import { Category, Product, Order, SiteSettings } from '@/types/database';

export const INITIAL_MOCK_SETTINGS: SiteSettings = {
  id: 'mock-settings-id',
  contact_email: 'efaisal375@gmail.com',
  brand_name: 'Petal & Ink',
  tagline: 'Crafted with Elegance. Delivered with Love.',
  logo_url: '/logo.png',
};

export const INITIAL_MOCK_CATEGORIES: Category[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Wedding Invitations',
    slug: 'wedding-invitations',
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
    created_at: new Date().toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Greeting Cards',
    slug: 'greeting-cards',
    image_url: '/images/thank-you-greeting-card.png',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_MOCK_PRODUCTS: Product[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Ethereal Botanical Suite',
    slug: 'ethereal-botanical-suite',
    description: 'An exquisitely styled wedding invitation suite featuring soft watercolor botanical illustrations, gold leaf text accents, and clean typography. Custom tailored with your names, venue details, and RSVP note.',
    price: 4500,
    image_urls: [
      '/images/ethereal-botanical-suite.png'
    ],
    custom_fields: [
      { name: 'Bride Name', type: 'text', required: true },
      { name: 'Groom Name', type: 'text', required: true },
      { name: 'Wedding Date & Time', type: 'text', required: true },
      { name: 'Venue Location', type: 'text', required: true },
      { name: 'Special Note / Quranic Verse', type: 'text', required: false }
    ],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Minimalist Monogram Save The Date',
    slug: 'minimalist-monogram-save-the-date',
    description: 'A sleek, high-contrast digital Save The Date design with modern typography and paired initials monogram. Ideal for sharing over WhatsApp, Instagram, or email.',
    price: 2800,
    image_urls: [
      '/images/minimalist-monogram-save-the-date.png'
    ],
    custom_fields: [
      { name: 'Couple Initials', type: 'text', required: true },
      { name: 'Couple Full Names', type: 'text', required: true },
      { name: 'Event Date', type: 'text', required: true },
      { name: 'City', type: 'text', required: true }
    ],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Bespoke Floral Thank You Card',
    slug: 'bespoke-floral-thank-you-card',
    description: 'An elegant, dusty rose digital thank you card featuring delicate botanical line art, grid texture, and personalized confirmation messaging.',
    price: 1800,
    image_urls: [
      '/images/thank-you-greeting-card.png'
    ],
    custom_fields: [
      { name: 'Recipient Name', type: 'text', required: true },
      { name: 'Sender Name / Studio Name', type: 'text', required: true },
      { name: 'Personal Thank You Note', type: 'text', required: true }
    ],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
  }
];

export const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 'ord-8f92a10b',
    customer_name: 'Ayesha Khan',
    phone: '+92 300 1234567',
    email: 'ayesha.k@example.com',
    notes: 'Please keep the typography soft and pink accented.',
    status: 'pending',
    total_price: 4500,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    order_items: [
      {
        id: 'item-1',
        order_id: 'ord-8f92a10b',
        product_id: 'p1000000-0000-0000-0000-000000000001',
        product_name_snapshot: 'Ethereal Botanical Suite',
        price_at_purchase: 4500,
        quantity: 1,
        custom_field_values: {
          'Bride Name': 'Ayesha Khan',
          'Groom Name': 'Bilal Ahmed',
          'Wedding Date & Time': '24th December 2026 at 7:00 PM',
          'Venue Location': 'Faletti\'s Hotel, Lahore',
          'Special Note / Quranic Verse': 'And We created you in pairs (78:8)'
        }
      }
    ]
  }
];
