# ShopHub - Ecommerce Frontend

A modern, fully responsive ecommerce platform built with **Next.js 16+**, **React 19**, **Tailwind CSS 4**, and **Server-Side Rendering (SSR)**.

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # App Router (SSR Pages)
│   │   ├── layout.js                 # Root layout with providers
│   │   ├── page.js                   # Landing page with hero & featured products
│   │   ├── products/
│   │   │   └── page.js              # All products page
│   │   ├── cart/
│   │   │   ├── page.js              # Cart page (SSR)
│   │   │   └── CartPageContent.jsx  # Cart client component
│   │   ├── login/
│   │   │   ├── page.js              # Login page (SSR)
│   │   │   └── LoginPageContent.jsx # Auth form client component
│   │   ├── globals.css              # Global Tailwind styles
│   │   └── providers.jsx            # Context providers wrapper
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx           # Navigation bar (client)
│   │   │   └── Footer.jsx           # Footer (client)
│   │   ├── product/
│   │   │   ├── ProductCard.jsx      # Single product card (client)
│   │   │   └── ProductGrid.jsx      # Products grid with filters (client)
│   │   ├── ui/
│   │   │   ├── Button.jsx           # Reusable button component
│   │   │   ├── Input.jsx            # Reusable input component
│   │   │   └── Modal.jsx            # Reusable modal component
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Authentication context
│   │   │   └── CartContext.jsx      # Shopping cart context
│   │   ├── data/
│   │   │   └── products.js          # Mock product data
│   │   └── utils/
│   │       └── helpers.js           # Utility functions
│   └── public/                       # Static assets
├── package.json
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.mjs               # PostCSS configuration
├── next.config.mjs                  # Next.js configuration
└── jsconfig.json                    # JavaScript config with path aliases
```

## Architecture

### Server-Side Rendering (SSR)
- **Pages** (`/app/**/*.js`) - All page files use SSR by default
- These components have access to `metadata`, `generateMetadata()`, and other server-only features
- Provides better SEO and initial page load performance

### Client-Side Components
- Marked with `"use client"` directive
- Include interactivity (state, hooks, event listeners)
- Components include:
  - UI Components (Button, Input, Modal)
  - Layout Components (Navbar, Footer)
  - Product Components (ProductCard, ProductGrid)
  - Page Content Components (LoginPageContent, CartPageContent)
  - Context Providers (AuthContext, CartContext)

## Features

### 1. **Hero Section** (Landing Page)
- Eye-catching banner with call-to-action buttons
- Trust indicators showing customers, products, and support
- Promotional banner for flash sales

### 2. **Product Showcase**
- Responsive product grid (1 col on mobile, 2 on tablet, 4 on desktop)
- Product cards with:
  - Image with zoom hover effect
  - Pricing with discount calculation
  - Star ratings with review count
  - Add to cart functionality
  - Sale/New/Best Seller badges

### 3. **Product Filtering & Sorting**
- Filter by category (All, Electronics, Fashion, Home)
- Sort options (Featured, Price Low-High, Price High-Low, Rating, Newest)
- Real-time filtering without page reload

### 4. **Shopping Cart**
- Add/remove items
- Update quantities
- Real-time price calculations
- Cart summary with subtotal, tax, and total
- Persistent cart using context API

### 5. **Authentication**
- Login/Sign up forms
- Mock authentication with localStorage
- Protected context with `useAuth()` hook
- Social login buttons (UI ready)

### 6. **Responsive Design**
- Mobile-first approach using Tailwind CSS
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- All pages tested for mobile, tablet, and desktop views

### 7. **Tailwind CSS Styling**
- Modern utility-first CSS framework
- Dark mode ready (can be enabled in `tailwind.config.js`)
- Consistent color scheme (Blue for primary, Gray for neutrals)
- Custom spacing, fonts, and animations

## Getting Started

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Context API

### Cart Context (`CartContext.jsx`)
```javascript
const { cart, addToCart, removeFromCart, updateQuantity, getTotalPrice } = useCart();
```

### Auth Context (`AuthContext.jsx`)
```javascript
const { user, loading, login, logout, signup } = useAuth();
```

## Styling

### Tailwind CSS Configuration
All components use Tailwind utility classes. Key color scheme:
- **Primary**: Blue (`blue-600`, `blue-700`)
- **Secondary**: Gray (`gray-600`, `gray-900`)
- **Accent**: Red (`red-600` for errors/alerts), Green (`green-600` for success)

### CSS Classes Examples
```jsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// Flexbox
<div className="flex justify-between items-center">

// Text styling
<h1 className="text-3xl md:text-4xl font-bold">

// Spacing
<div className="p-4 md:p-8">
```

## Routing

| Route | Page | Type | Features |
|-------|------|------|----------|
| `/` | Home/Landing | SSR | Hero section, featured products |
| `/products` | All Products | SSR | Product grid, filters, sorting |
| `/cart` | Shopping Cart | SSR + Client | Cart management, checkout preview |
| `/login` | Login/Signup | SSR + Client | Authentication forms |

## API Integration Ready

All data currently uses mock data from `products.js`. To integrate with a backend API:

1. **Replace mock data** in `products.js` with API calls
2. **Add environment variables** in `.env.local`
3. **Update contexts** (CartContext, AuthContext) to make API calls
4. **Add error handling** and loading states

## Next Steps

1. **Connect Backend API** - Replace mock data with real API endpoints
2. **Add Payment Processing** - Integrate Stripe or similar
3. **User Dashboard** - Order history, wishlist, profile management
4. **Product Search** - Full-text search functionality
5. **Admin Panel** - Manage products, orders, users
6. **Email Notifications** - Order confirmations, shipping updates
7. **Analytics** - Track user behavior and conversions

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Using Next.js Image component
- **CSS Optimization**: Tailwind CSS purges unused styles
- **SEO**: Server-side rendering with metadata

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React 19 Docs](https://react.dev)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

## License

MIT License - Feel free to use for your projects

---

**Built with ❤️ using Next.js and Tailwind CSS**
