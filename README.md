# Steash_Scoop - Premium Women's Accessories E-Commerce Frontend

**Steash_Scoop** is a modern, responsive, high-performance e-commerce frontend built using **ReactJS (ES6+)**, **Bootstrap 5**, and **CSS3**. It delivers a luxury online shopping experience for premium women's accessories, hair clips, scrunchies, stationery, bags, and jewelry.

---

## 🎨 Color Palette & Design System

The visual theme uses a warm, luxury e-commerce palette:

* **Background:** `#FFF8F3` (Warm Ivory)
* **Primary:** `#FF6B35` (Vibrant Coral/Orange)
* **Secondary:** `#2D2D2D` (Charcoal Black)
* **Accent:** `#F7C59F` (Soft Peach)
* **Text:** `#222222` (Deep Obsidian)
* **Muted Text:** `#777777` (Slate Gray)

---

## 📁 Project Structure

```text
steash_scoop/
│
├── public/
│   ├── images/
│   │   └── products/
│   ├── favicon.svg
│   └── favicon.ico
│
├── src/
│   ├── assets/
│   │   └── .gitkeep
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CategoryCard.jsx
│   │   ├── SearchBar.jsx
│   │   ├── CartItem.jsx
│   │   ├── ProductFilter.jsx
│   │   ├── QuickViewModal.jsx
│   │   ├── ToastNotification.jsx
│   │   └── Rating.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Shop.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Cart.jsx
│   │   ├── Wishlist.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Checkout.jsx
│   │   └── NotFound.jsx
│   │
│   ├── data/
│   │   └── products.js
│   │
│   ├── context/
│   │   └── ShopContext.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
├── index.html
└── README.md
```

---

## ✨ Features & Functionality

1. **Responsive Navbar**: Sticky header with brand logo, search modal, cart counter badge, wishlist badge, and mobile drawer menu.
2. **Interactive Homepage**:
   - Hero banner with CTA buttons and float animation.
   - Shop By Category grid with product count badges.
   - Featured Products card grid with hover zoom effects.
   - 🔥 **Flash Deals** section with real-time countdown timer.
   - ✨ **New Drops** carousel-style highlight.
   - Customer Reviews & Ratings.
   - Newsletter subscription form with instant toast feedback.
3. **Comprehensive Shop Page**:
   - Live product search filtering.
   - Category selection & price range slider.
   - Rating filter & sorting (Popularity, Price Low to High, Price High to Low, Rating).
   - Responsive product grid with pagination.
4. **Product Details Page**:
   - Image gallery & quick view modal.
   - Star rating breakdown & review counters.
   - Stock availability badge, size/color selector, and quantity controls.
   - Tabbed section for Description, Specifications, Reviews & Shipping.
5. **Full Cart & Wishlist System**:
   - Dynamic quantity increase/decrease & item removal.
   - Real-time subtotal, discount, shipping, and total calculation.
   - Wishlist heart toggle across all product cards.
6. **User Authentication & Checkout**:
   - Login page with password show/toggle & form validation.
   - Register page with full validation.
   - Checkout page with Customer Details, Shipping Address, Order Summary, and Payment Method selection.

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* npm (v9 or higher)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build for production
npm run build
```

---

## 🛡️ License

© 2026 **Steash_Scoop**. All Rights Reserved.
