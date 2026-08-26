# OWEL — Luxury Digital Boutique Frontend (Angular Zoneless & Signals)

A high-performance luxury storefront built with **Angular (Zoneless)**, **NgRx SignalStore**, **Tailwind CSS**, and an **Integrated RAG AI Concierge Chatbot**.

---

## 💎 Design System & Aesthetic Foundation

- **Obsidian (`#111111`)**: Timeless elegance, hero contrasts, primary CTA elements.
- **Warm Ivory (`#F7F4EE`)**: Organic gallery background for a tranquil luxury experience.
- **Terracotta (`#C96F4A`)**: Exclusive privileges, discounts, and active state highlights.
- **Stone (`#D8D2C7`)**: Neutral structural dividers and borders.
- **Currency**: **Egyptian Pound (`EGP` / `ج.م`)**.

---

## 🚀 Key Features & Capabilities

1. **Angular Zoneless & Reactive Signals**:
   - Built on Angular’s next-gen zoneless change detection and NgRx SignalStore for instantaneous reactivity.
2. **Curated Product Catalog**:
   - Consistent 6-card pagination, real-time search, category/brand filter pills, price range sliders, and sorting.
   - Dual cover & gallery sub-images preview.
3. **Shopping Bag & Privilege Checkout**:
   - Slide-over bag drawer with live calculation, single-use coupon verification (`OWEL20`, `SUPER50`), and Paymob card integration.
4. **Patron Review & Rating Engine**:
   - 0.0 to 5.0 rating scale, star picker, verified review submission, and instant average score updates.
5. **AI Concierge Chatbot (Facebook / Messenger Style)**:
   - Floating widget with active status indicator, quick prompt suggestion chips, bilingual response rendering, and automatic **RTL/LTR text direction detection**.
   - Integrated with Webhook / RAG backend.
6. **SEO & Social Meta Management (`SeoService`)**:
   - Dynamic page titles, meta descriptions, Open Graph (`og:title`, `og:image`, `og:url`), and Twitter Cards per route and product.
7. **Admin Command Center**:
   - Management console for Catalog, Inventory, Orders (with specification modal & status switches), Categories, Brands, and Coupons.

---

## 📂 Architecture & Directory Layout

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── interceptors/  # Auth JWT token & refresh interceptor
│   │   │   ├── models/        # TypeScript data models (Product, Order, Review, User...)
│   │   │   ├── pipes/         # Image URL resolver
│   │   │   ├── services/      # ApiService, TokenService, ToastService, ChatbotService, SeoService
│   │   │   └── stores/        # NgRx SignalStores (Auth, Cart, Wishlist, Products, Orders...)
│   │   ├── features/
│   │   │   ├── home/          # Hero banner, department curation, featured products
│   │   │   ├── shop/          # Catalog browser with 6-item pagination
│   │   │   ├── product-detail/# High-res gallery, specs, stock alerts, reviews
│   │   │   ├── cart/          # Full-page shopping bag
│   │   │   ├── checkout/      # Address, Paymob / COD payment selection
│   │   │   ├── orders/        # Purchase history & receipts
│   │   │   ├── wishlist/      # Saved favorite pieces
│   │   │   └── admin/         # Store administration console
│   │   ├── shared/
│   │   │   ├── components/    # Navbar, Footer, CartDrawer, AuthModal, Toast, Chatbot, ProductCard
│   │   ├── app.config.ts      # Angular application config (Zoneless, HttpClient, Router)
│   │   ├── app.html           # Root layout mounting global navigation, modals, and AI Chatbot
│   │   └── app.ts             # Root component with store initialization & SEO
│   ├── styles.css             # Tailwind base, luxury animations, skeleton shimmer
│   └── index.html             # HTML entry with font preloads & meta tags
```

---

## 🛠️ Development & Production Commands

```bash
# Install dependencies
npm install

# Start local development server (http://localhost:4200)
npm start

# Build production bundle with full optimization
npm run build
```

---

## 🤖 AI Concierge RAG Integration

The AI Concierge connects to a RAG webhook to answer patron inquiries in real time.
Knowledge base files are located under `/rag_knowledge_base` with structured markdown documentation covering:
- Brand Heritage & Values
- Product Catalog & Specs
- Paymob & COD Payment Options
- Privilege Coupon Validation Rules
- 14-Day Return & Shipping Policies
- Bilingual Q&A FAQ Dataset
