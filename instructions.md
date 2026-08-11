# Master Prompt: "Petal & Ink" Digital Products Storefront

Copy everything below into your vibe-coding tool (Cursor, Claude Code, Lovable, etc.) as the starting instruction.

---

## Project Overview

Build **Petal & Ink**, a Next.js e-commerce storefront that sells **custom-made digital design products**: greeting cards, wedding invitations, landing page designs, and order-taking form designs. Every product is customized with customer-provided text before it's created. There is **no instant file download** — the designer delivers the finished file manually via WhatsApp/email after the order is placed. This is a "custom order" storefront, not an instant-download shop.

## Tech Stack

- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Database & Storage:** Supabase (Postgres + Storage for product images)
- **Auth:** Supabase Auth, used ONLY for the admin dashboard login (no customer accounts — checkout is guest-only)
- **Hosting:** Vercel
- **Currency:** PKR only, formatted as "Rs. X,XXX"

## Brand & Design Direction

- Store name: **Petal & Ink**
- Visual style: elegant and minimal — soft, muted color palette (blush, cream, sage, or dusty rose tones), generous whitespace, refined serif or elegant sans-serif headings, subtle transitions/animations. Avoid loud colors or cluttered layouts.
- The landing page should feel like a boutique design studio, not a generic online store.

## Site Structure / Pages

1. **Landing Page (`/`)**
   - Hero section introducing Petal & Ink with a strong visual and tagline
   - Featured/best-selling products
   - Category showcase (pulled dynamically from admin-managed categories)
   - "How it works" section explaining: browse → customize → order → we contact you on WhatsApp → pay → receive your design
   - Footer with contact info and WhatsApp link

2. **Shop / Catalog Page (`/shop`)**
   - Grid of all products, filterable by category
   - Categories are NOT hardcoded — they come from the database and are managed by the admin

3. **Product Detail Page (`/product/[slug]`)**
   - Product images, description, price
   - Customization form: rendered dynamically from the product's `custom_fields` array — one plain text input per field, labeled with `name`, marked visually if `required` is true, and validated before allowing add-to-cart (required fields must be filled; optional fields can be left blank)
   - "Add to Cart" button (with filled-in customization data attached to that cart item)

4. **Cart Page (`/cart`)**
   - List of items with their customization details, quantity, price, subtotal
   - "Proceed to Checkout" button

5. **Checkout Page (`/checkout`)**
   - Guest checkout only — no login required
   - Collect: full name, phone number, email (optional), delivery notes
   - Order summary
   - On submit: save the order to the database with status `pending`
   - Show a confirmation screen: "Your order has been received! Please email us at **efaisal375@gmail.com** with your order details to confirm payment (JazzCash/Easypaisa/bank transfer) and we'll get started on your design." Include the customer's name and item list on this screen so they can reference it in their email.
   - The contact email shown here should be pulled from `site_settings.contact_email`, not hardcoded.

6. **Admin Dashboard (`/admin`, password-protected via Supabase Auth)**
   - **Login page** — email/password
   - **Products management:** create/edit products — name, description, price, images (upload to Supabase Storage), category, and the list of customization text fields this product needs. For each field, the admin sets a name/label and toggles whether it's required (e.g. "Bride Name" required, "Special Message" optional). Use the `is_active` toggle to show/hide a product from the shop instead of deleting it. Use `is_featured` to control homepage placement.
   - **Categories management:** create/edit/delete categories freely (this is what makes categories flexible, not fixed)
   - **Orders dashboard:** view all orders with customer contact info, items ordered, customization details submitted, and current status. Allow status updates: `pending → confirmed → in progress → delivered`
   - **Site settings:** a simple form to edit `contact_email`, `brand_name`, `tagline`, and `logo_url` — these values are pulled live into the storefront (landing page, checkout confirmation, footer)
   - Clean, simple, functional UI (doesn't need to match the storefront's elegant branding — just needs to be usable)

## Database Schema (Supabase / Postgres)

**`categories`**
- id (uuid, PK)
- name (text)
- slug (text, unique)
- image_url (text) — used for category showcase cards on the homepage
- created_at (timestamp)

**`products`**
- id (uuid, PK)
- category_id (uuid, FK → categories)
- name (text)
- slug (text, unique)
- description (text)
- price (integer) — whole PKR, no decimals
- image_urls (text[]) — gallery images
- custom_fields (jsonb) — array of field objects, each with `{ "name": string, "type": "text", "required": boolean }`, e.g.:
  ```json
  [
    { "name": "Bride Name", "type": "text", "required": true },
    { "name": "Groom Name", "type": "text", "required": true },
    { "name": "Special Message", "type": "text", "required": false }
  ]
  ```
  `type` is fixed to `"text"` for now (no textarea/other types yet), but the explicit object structure means new field types can be added later purely on the frontend, with no database migration. `required` is a real per-field toggle set by the admin — both the admin product form and the customer-facing customization form must respect it.
- is_active (boolean, default true) — soft-hide toggle; inactive products are hidden from the shop but never hard-deleted, so historical orders referencing them stay intact
- is_featured (boolean, default false) — shown on homepage featured section
- created_at (timestamp)

**`orders`**
- id (uuid, PK)
- customer_name (text)
- phone (text)
- email (text, nullable)
- notes (text, nullable)
- status (text) — one of `pending` | `confirmed` | `in_progress` | `delivered`, default `pending`
- total_price (integer)
- created_at (timestamp)
- No separate order_number field — the admin dashboard references orders by their id/created_at, since there's no public order-tracking page.

**`order_items`**
- id (uuid, PK)
- order_id (uuid, FK → orders)
- product_id (uuid, FK → products)
- product_name_snapshot (text) — copied at time of purchase so later edits/deactivation of the product don't corrupt order history
- price_at_purchase (integer)
- quantity (integer)
- custom_field_values (jsonb) — flat object mapping each field's `name` → the customer's submitted value, e.g. `{"Bride Name": "Ayesha", "Groom Name": "Bilal", "Special Message": ""}`. Only fields marked `required: true` on the product must be filled before checkout; optional fields can be submitted empty.

**`site_settings`**
- id (uuid, PK, single row table)
- contact_email (text, default `efaisal375@gmail.com`)
- brand_name (text, default `Petal & Ink`)
- tagline (text)
- logo_url (text)
- This table lets the admin change contact email, brand name, tagline, and logo from the dashboard without touching code.

## Customer Order Flow (Important Detail)

1. Customer browses shop, opens a product
2. Customer fills in the product's custom text fields (defined per-product by admin) and adds to cart
3. Cart can hold multiple customized items
4. Checkout collects contact info only (no payment form — no payment gateway integration needed)
5. On order submission: order is saved to Supabase with status `pending`, and a confirmation screen tells the customer to email the store (address pulled from `site_settings.contact_email`) to arrange payment (JazzCash/Easypaisa/bank transfer)
6. Store owner manages the rest of the process (payment confirmation, design delivery) from the admin dashboard, updating order status as it progresses

## Explicitly Out of Scope (do not build these)

- No payment gateway integration (Stripe/PayPal/JazzCash API) — payment is confirmed manually via email
- No customer accounts, login, or order history for customers
- No automatic file delivery/download system — all delivery is manual
- No live design preview/canvas — customization is plain text fields only

## Deployment

- Structure the project to deploy cleanly on Vercel
- Use environment variables for Supabase URL/keys
- Include a basic README with setup steps (Supabase project creation, env vars, running locally, deploying)

---

**Build this as a complete, working Next.js application with all pages, the admin dashboard, and Supabase integration wired up end-to-end.**
