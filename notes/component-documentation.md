# Component Documentation

## Shop System Components

### ShopView (`components/shop/shop-view.tsx`)
**Purpose**: Main shop interface with Pinterest-style product browsing

**Key Features**:
- Four-tab navigation (Shop, Categories, My Shop, Orders)
- Pinterest-style masonry layout for product display
- Centered modal overlays for product information
- Comprehensive shop management functionality
- Coming soon messaging with elegant design

**State Management**:
- `activeTab`: Current tab selection
- `userShop`: User's shop data from localStorage
- `showCreateShop`: Create shop modal visibility
- `showEditShop`: Edit shop modal visibility
- `editingProduct`: Product being edited

**Notable Implementations**:
- Real Unsplash images for authentic product display
- Info icon overlays with glassmorphism design
- Arabic-inspired decorative elements
- Wedding-focused category prioritization

### ShopItemView (`components/shop/shop-item-view.tsx`)
**Purpose**: Detailed product page with purchase functionality

**Key Features**:
- Consistent header with navigation
- Image gallery with thumbnail navigation
- Dedicated video section
- Seller information with verification
- Size/color selection for clothing items
- Clean product information display

**Data Structure**:
- Only shows data collected from add product form
- Available sizes/colors displayed as informational badges
- Interactive selection for clothing categories
- Comprehensive seller contact information

### AddProductView (`components/shop/add-product-view.tsx`)
**Purpose**: Product creation and editing interface

**Key Features**:
- Multi-step form for product details
- Image upload functionality
- Category-specific fields (sizes/colors for clothing)
- Price setting in SOL or SAMAA tokens
- Product description and specifications

## UI Components

### CelestialBackground (`components/ui/celestial-background.tsx`)
**Purpose**: Animated background with floating elements

**Features**:
- Gradient background with celestial theme
- Floating animated elements
- Configurable intensity levels
- Performance-optimized animations

### MobileHero (`components/mobile/mobile-hero.tsx`)
**Purpose**: Landing page hero section

**Features**:
- Elegant Islamic-inspired design
- Arabic corner decorations
- Gradient text effects
- Responsive layout for mobile-first design

## Form Components

### Profile Setup (`components/auth/profile-setup/`)
**Purpose**: Multi-step user profile creation

**Structure**:
- Basic information (two-column layout)
- Location detection and display
- Interests input (comma-separated)
- Islamic values and preferences
- Marriage timeline and expectations

**Design Patterns**:
- Clean, minimal interface
- Progressive disclosure
- Cultural sensitivity in form fields
- Mobile-optimized input methods

## Data Interfaces

### Product Interface
```typescript
interface Product {
  id: string
  name: string
  description: string
  images: string[]
  video?: string
  price: number
  currency: "SOL" | "SAMAA"
  category: string
  seller: string
  rating: number
  reviews: number
  inStock: boolean
  shopId?: string
  sizes?: string[]
  colors?: string[]
}
```

### UserShop Interface
```typescript
interface UserShop {
  id: string
  name: string
  description: string
  ownerWallet: string
  logo?: string
  banner?: string
  products: Product[]
  createdAt: string
  isActive: boolean
  // Business Information
  shippingPolicy: string
  returnPolicy: string
  contactEmail: string
  contactPhone?: string
  businessAddress?: string
  shippingMethods: string[]
  processingTime: string
}
```

## Styling Patterns

### Card Design
- Transparent backgrounds with subtle borders
- Arabic-inspired corner decorations
- Hover effects with scale and shadow
- Glassmorphism for overlays

### Color System
- Primary gradients: Indigo to Purple
- Category-specific gradients for organization
- Yellow accents for close buttons and highlights
- Consistent opacity levels for transparency

### Animation Patterns
- Framer Motion for component transitions
- CSS transforms for hover effects
- Staggered animations for visual interest
- Performance-optimized with GPU acceleration

## Layout Systems

### Masonry Grid
- CSS `columns-2` for true masonry layout
- Natural image aspect ratios
- Consistent spacing with inline styles
- Break-inside-avoid for proper flow

### Modal System
- Centered overlays with backdrop blur
- Click-outside-to-close functionality
- Proper z-index management
- Scroll handling for long content

### Navigation Patterns
- Sticky headers with backdrop blur
- Tab-based navigation with visual indicators
- Breadcrumb navigation for deep pages
- Mobile-optimized touch targets

## State Management Patterns

### Local Storage
- Shop data persistence
- User preferences
- Product information
- Form state preservation

### React Hooks
- useState for component state
- useEffect for lifecycle management
- Custom hooks for reusable logic
- Proper cleanup and memory management

## Performance Considerations

### Image Optimization
- Proper sizing with Unsplash parameters
- Lazy loading for better performance
- Aspect ratio preservation
- Responsive image delivery

### Animation Performance
- CSS transforms over layout changes
- GPU acceleration for smooth animations
- Debounced scroll events
- Efficient re-rendering patterns

## Accessibility Features

### Keyboard Navigation
- Proper tab order
- Focus management in modals
- Escape key handling
- Enter key activation

### Screen Reader Support
- Semantic HTML structure
- ARIA labels and descriptions
- Proper heading hierarchy
- Alternative text for images

### Touch Accessibility
- Minimum 44px touch targets
- Proper spacing between interactive elements
- Clear visual feedback
- Gesture support where appropriate

## Cultural Considerations

### Islamic Design Elements
- Arabic-inspired corner decorations
- Geometric patterns in backgrounds
- Traditional color interpretations
- Modest fashion focus in categories

### Content Sensitivity
- Appropriate imagery selection
- Cultural context in messaging
- Halal business practice emphasis
- Community values integration

## Notification System

### Notification Cards Design Pattern
- **Gradient Backgrounds**: Type-specific color gradients (pink for likes, blue for messages, purple for matches)
- **Avatar Integration**: Circular profile images or emoji icons for system notifications
- **Card Structure**: Flex layout with avatar, content, and unread indicator
- **Hover Effects**: Shadow and scale animations on interaction
- **Ring Indicators**: Unread notifications have indigo ring border
- **Typography**: Qurova for titles, Queensides for descriptions

### Notification Types
- **Like**: Pink gradient (`from-pink-100 to-red-100`), heart emoji, profile avatar
- **Message**: Blue gradient (`from-blue-100 to-indigo-100`), message emoji, profile avatar
- **Match**: Purple gradient (`from-purple-100 to-indigo-100`), sparkle emoji, profile avatar
- **Gift**: Yellow gradient (`from-yellow-100 to-orange-100`), gift emoji, profile avatar
- **System**: Gray gradient (`from-gray-100 to-slate-100`), bell emoji, no avatar

### Tab System
- **Grid Layout**: 4-column tab grid with icons and labels
- **Active States**: Gradient backgrounds and shadow effects
- **Icon Integration**: Lucide icons with proper sizing
- **Smooth Transitions**: 300ms duration animations
- **Backdrop Blur**: Glass morphism effect with border styling

### Empty State
- **Clean Design**: Simple card with bell icon and encouraging message
- **Consistent Styling**: Matches overall app design language
- **User Guidance**: "You're all caught up!" messaging

---

*Component documentation reflects current implementation with focus on maintainability, accessibility, and cultural appropriateness.*
