# Petal & Ink - Custom Digital Products Storefront

**Petal & Ink** is a Next.js e-commerce storefront that sells custom-made digital design products (greeting cards, wedding invitations, landing page layouts, and order-taking forms). Every product is customized with customer-provided text before creation. Orders are saved with `pending` status, and customers confirm payment manually via email/WhatsApp (JazzCash, Easypaisa, Bank Transfer).

---

## 🌟 Key Features

- **Storefront Landing Page (`/`)**: Boutique design hero, featured products grid, dynamic categories showcase, step-by-step "How It Works" guide, and studio contact options.
- **Catalog Shop (`/shop`)**: Dynamic category filter pills (loaded live from Supabase database), search bar, and price sorting.
- **Dynamic Customization Form (`/product/[slug]`)**: Product detail page with dynamic form builder rendered from each product's `custom_fields` array. Supports per-field label and `required` validation before adding to cart.
- **Cart & Guest Checkout (`/cart`, `/checkout`)**: Shopping cart holding custom field item snapshots, guest checkout form, order total calculation in PKR (`Rs. X,XXX`).
- **Confirmation Screen**: Displays order reference ID, submitted customer items, and instructions to email `site_settings.contact_email` for payment confirmation.
- **Admin Dashboard (`/admin`)**:
  - **Orders Dashboard**: Filter and manage orders, view customer contact info & custom submitted text, update order status (`pending -> confirmed -> in_progress -> delivered`).
  - **Products Manager**: Create/edit products, set prices in PKR, toggle `is_active` soft-hide & `is_featured`, and manage custom text input fields dynamically.
  - **Categories Manager**: Create, edit, and delete categories freely.
  - **Site Settings**: Edit `contact_email`, `brand_name`, `tagline`, and `logo_url`.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom boutique design tokens (blush rose, dusty rose, sage, cream, playfair display & cormorant fonts)
- **Database & Storage**: Supabase (PostgreSQL + RLS Policies)
- **Auth**: Supabase Auth (for Admin Dashboard) / Local Demo Auth Fallback
- **Currency**: PKR (`Rs. X,XXX`)

---

## 🚀 Local Development Quickstart

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: The application includes an out-of-the-box local fallback store with rich seed data. You can browse products, customize items, place guest orders, and test the admin dashboard immediately!

---

## 🗄️ Supabase Setup & Environment Variables

To connect your own live Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in Supabase dashboard and run the contents of [supabase/schema.sql](supabase/schema.sql).
3. Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Create an Admin user in **Supabase Auth** -> **Users** to log in at `/admin/login`.

---

## 📦 Deploying to Vercel

1. Push this repository to GitHub/GitLab.
2. Import project in [Vercel](https://vercel.com).
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Environment Variables.
4. Deploy!
