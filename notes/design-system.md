# Samaa Design System & Implementation Notes

## Project Overview
Samaa is a Muslim dating/marriage mobile-first application with web3 integration, using token-based access instead of monthly fees. The platform focuses on Islamic values with integrated wedding shopping and crypto wallet onboarding for newcomers.

## Core Features
- **Dowry wallets** for men, **purse wallets** for women
- **AI bio ratings** and **public voice notes**
- **Integrated shop** with wedding focus
- **Crypto wallet onboarding** for newcomers
- **Supabase database** with search functionality

## Smart NFT Wallet System
- **Smart NFTs**: NFTs that can hold assets, not just represent ownership
- **Dowry Wallets**: Men purchase Smart NFTs to use as dowry storage
- **Purse Wallets**: Women purchase Smart NFTs to use as purse storage
- **Vault Address**: Each Smart NFT has a unique vault address to hold assets
- **Owner-Only Access**: Only the NFT owner can access the vault assets
- **Time Lock Controls**: Owners can lock the vault until a future date
- **Asset Storage**: Can hold SOL, SAMAA tokens, and other Solana assets
- **Marriage Integration**: Wallets can be transferred or unlocked for marriage ceremonies

## Design Philosophy

### Theme & Colors
- **Light theme only** (no dark theme)
- **Primary Colors**: Indigo (#4F46E5) to Purple (#7C3AED) gradients
- **Accent Colors**: Yellow (#FCD34D) for highlights and close buttons
- **Background**: Celestial modal background with floating elements
- **Cards**: Transparent with subtle borders and Arabic-inspired styling

### Typography System
- **Qurova**: Branding, logos, splash screens, and main headings
- **Monainn**: Body text and general content
- **Queensides**: Sub headers and secondary text
- **Datttermatter**: Special "match made in heaven" text

### Spacing & Layout
- **Golden ratio spacing** throughout the application
- **Arabic-inspired borders** for cards, similar to mobile hero cards
- **Larger font sizes** for key messages and better readability
- **Tighter spacing** between cards on mobile for efficiency

## Elegant Design System (Standard Approach)

### Card Design Pattern
**Use this pattern for all major content sections:**

```jsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  className="relative group mb-8"
>
  <div className="relative rounded-2xl p-8 border-2 border-[COLOR]-300/20 hover:border-[COLOR]-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-[COLOR]-50/50 to-[COLOR2]-50/30">
    {/* Arabic-inspired corner decorations */}
    <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-[COLOR]-400/60 rounded-tl-xl"></div>
    <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-[COLOR2]-400/60 rounded-tr-xl"></div>
    <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-[COLOR2]-400/60 rounded-bl-xl"></div>
    <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-[COLOR]-400/60 rounded-br-xl"></div>

    {/* Geometric pattern overlay */}
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-[COLOR]-300/30 rounded-full opacity-20"></div>
    <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[COLOR2]-300/20 rounded-full"></div>
    <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-[COLOR]-300/20 rounded-full"></div>

    <div className="relative z-10">
      {/* Content goes here */}
    </div>
  </div>
</motion.div>
```

### Icon Design Pattern
**Use this pattern for all major icons:**

```jsx
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ delay: 0.3, duration: 0.6 }}
  className="w-20 h-20 bg-gradient-to-br from-[COLOR]-100 to-[COLOR2]-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-[COLOR]-200/50"
>
  <IconComponent className="w-10 h-10 text-[COLOR]-600" />
</motion.div>
```

### Typography Hierarchy
**Use this hierarchy for all content sections:**

1. **Main Title**: `text-3xl font-bold text-slate-800 mb-4 font-qurova`
2. **Description**: `text-lg text-slate-600 font-queensides leading-relaxed mb-6 max-w-sm mx-auto`
3. **Gradient Highlights**: `font-semibold bg-gradient-to-r from-[COLOR]-600 to-[COLOR2]-600 bg-clip-text text-transparent`
4. **Section Headers**: `text-base text-[COLOR]-600 font-queensides font-semibold`
5. **Small Text**: `text-sm font-queensides text-slate-700 font-semibold`

### Action Card Pattern
**Use this pattern for feature lists and action items:**

```jsx
<div className="grid grid-cols-1 gap-3 max-w-xs mx-auto">
  <div className="bg-gradient-to-br from-[COLOR]-50 to-[COLOR]-100 rounded-xl p-4 border border-[COLOR]-200/50 shadow-sm">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-[COLOR]-500 rounded-full flex items-center justify-center">
        <IconComponent className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-queensides text-slate-700 font-semibold">Action text</span>
    </div>
  </div>
</div>
```

### Trust Indicators Pattern
**Use this pattern for credibility elements:**

```jsx
<div className="flex justify-center space-x-4 text-sm">
  <div className="flex items-center space-x-2 text-[COLOR]-600">
    <div className="w-2 h-2 bg-[COLOR]-500/70 rounded-full"></div>
    <span className="font-queensides">Trust Element</span>
  </div>
</div>
```

### Elegant Divider Pattern
**Use this pattern for section separators:**

```jsx
<div className="flex items-center justify-center mt-6">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[COLOR]-300/30 to-transparent"></div>
  <div className="mx-4 flex items-center space-x-1">
    <div className="w-1 h-1 bg-[COLOR]-400/60 rounded-full"></div>
    <div className="w-2 h-2 border border-[COLOR]-400/40 rounded-full flex items-center justify-center">
      <div className="w-0.5 h-0.5 bg-[COLOR]-500/70 rounded-full"></div>
    </div>
    <div className="w-1 h-1 bg-[COLOR2]-400/60 rounded-full"></div>
  </div>
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[COLOR2]-300/30 to-transparent"></div>
</div>
```

### Color Theme Guidelines

#### Primary Themes (Use for main content):
- **Indigo-Purple**: `indigo` → `purple` (Primary business functions)
- **Blue-Indigo**: `blue` → `indigo` (Trust, reliability, orders)
- **Purple-Violet**: `purple` → `violet` (Premium features)

#### Secondary Themes (Use for specific contexts):
- **Amber-Orange**: `amber` → `orange` (Warnings, wallet connection)
- **Green-Emerald**: `green` → `emerald` (Success, actions, growth)
- **Pink-Rose**: `pink` → `rose` (Bride-focused content)
- **Slate-Gray**: `slate` → `gray` (Neutral, men's content)

#### Category-Specific Colors:
- **Bride Fashion**: Pink gradients (`pink` → `rose`)
- **Groom Fashion**: Blue gradients (`blue` → `indigo`)
- **Women's Fashion**: Purple gradients (`purple` → `violet`)
- **Men's Fashion**: Gray gradients (`slate` → `gray`)
- **Wedding Gifts**: Green gradients (`emerald` → `green`)
- **Accessories**: Amber gradients (`amber` → `yellow`)

### Animation Standards

#### Entrance Animations:
```jsx
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8, ease: "easeOut" }}
```

#### Icon Animations:
```jsx
initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ delay: 0.3, duration: 0.6 }}
```

#### Hover Effects:
```jsx
hover:border-[COLOR]-400/40
hover:shadow-lg
transition-all duration-300
```

### Content Strategy Guidelines

#### Messaging Approach:
1. **Islamic Values First**: Always emphasize halal business practices
2. **Community Focus**: Reference "Muslim community" and "Islamic business journey"
3. **Professional Credibility**: Use "Verified Islamic Business" and trust indicators
4. **Future-Focused**: Prepare users for upcoming features with "Coming Soon"
5. **Encouraging Tone**: Use positive, motivating language throughout

#### Content Structure:
1. **Icon + Title**: Large icon with clear, descriptive title
2. **Main Description**: Compelling copy with gradient highlights for key phrases
3. **Feature List**: Action cards showing specific benefits or steps
4. **Trust Elements**: Credibility indicators at the bottom
5. **Elegant Divider**: Professional closing element

### State-Based Design Patterns

#### Empty States:
- Use elegant cards with proper theming
- Include compelling calls-to-action
- Show preparation steps or benefits
- Maintain professional appearance

#### Loading States:
- Use skeleton screens with theme colors
- Maintain layout structure
- Include subtle animations

#### Error States:
- Use amber/orange themes for warnings
- Provide clear next steps
- Maintain elegant design even for errors

#### Success States:
- Use green themes for confirmations
- Include celebration elements
- Guide users to next actions

## Mobile UI Guidelines

### Navigation
- **Bottom Navigation**: 
  - Wallet button: icon-only
  - Center button: pulsing, acts as home when not on home page
  - Random matching profile modal when on home page
  - Remove heart icon from branding

### Headers
- **Full-width edge-to-edge** headers with tab styling
- **Fit under nav bar** with no margin/padding
- **Hide on scroll down**, reveal on scroll up
- **Gear button**: settings
- **Notifications icon**: notifications page
- **Profile icon**: profile setup

### Wallet Display
- **Truncated wallet address** instead of generic text
- **Educational section** for crypto newcomers
- **Clear onboarding** for web3 integration

## Page Structure

### Home Page
- **Minimal design** with "match made in heaven" text
- **Animated tooltip popups** for selling points
- **Simple buttons** for different user types
- **Celestial background** with floating elements

### Explore Page
- **3 tabs**:
  - "Wants You": suitors who sent messages
  - "Potentials": based on search settings
  - "You Want Them": matches user messaged

### Profile Pages
- **Compact layouts** with consistent headers
- **Scrollable sections** with interspersed pictures
- **Location under age** display
- **"About Me" card** with bio, Islamic values, marriage timeframe
- **Media sections** for photos and videos

### Settings Page
- **Match preferences** with age range dual sliders
- **Distance in miles** selector
- **Gender-specific preferences** (hijab only for males)

## Profile Setup System

### Form Structure
- **Components**: Located in `components/auth/profile-setup`
- **Two-column layout** for basic information card
- **Single-column** for other sections
- **Detected location** display (city, country) instead of manual input
- **Comma-separated input** for interests/hobbies
- **Clean interface** without redundant display sections

## Shop System

### Design Approach
- **Pinterest-style masonry layout** for product browsing
- **Image-focused discovery** with click-for-details
- **Wedding-focused categories** prioritizing bride and groom fashion
- **Professional e-commerce feel** with modern interactions

### Product Display
- **Two-column masonry grid** for mobile optimization
- **Natural image aspect ratios** for authentic presentation
- **Info icon overlays** for quick product details
- **Centered modal overlays** for detailed information
- **Real product photography** from Unsplash for authenticity

### Categories (Priority Order)
1. **Bride Fashion** 👰 (Pink gradient)
2. **Groom Fashion** 🤵 (Blue gradient)
3. **Women's Fashion** 👗 (Purple gradient)
4. **Men's Fashion** 👔 (Gray gradient)
5. **Wedding Gifts** 🎁 (Green gradient)
6. **Accessories** 💍 (Amber gradient)

### Shop Management
- **Complete business setup**: shipping, return policy, contact info
- **Working edit functionality** with pre-filled forms
- **Product management** with image uploads and detailed information
- **Professional seller profiles** with verification badges

## Message Cards

### Audio Messages
- **Circular profile images** with slim audio players
- **Arabic-themed borders** for cultural consistency
- **Minimal design** without showing names
- **Small cards** under players with timestamps
- **Action cards** only under active/playing audio
- **Delete/block icons** and reply buttons

## Component Architecture

### Key Components
- **CelestialBackground**: Animated background with floating elements
- **MobileHero**: Landing page with elegant Islamic-inspired design
- **ShopView**: Pinterest-style marketplace with masonry layout
- **ProfileSetup**: Multi-step form with cultural considerations
- **MessageCards**: Audio message interface with Islamic styling

### Styling Patterns
- **Glassmorphism**: `bg-white/95 backdrop-blur-sm` for modern overlays
- **Arabic corners**: Decorative corner borders for cultural authenticity
- **Gradient buttons**: Indigo to purple gradients for primary actions
- **Hover animations**: Subtle scale and shadow effects
- **Reveal animations**: Scroll-triggered animations for engagement

## Technical Implementation

### State Management
- **localStorage**: For shop data and user preferences
- **React hooks**: For component state and effects
- **Wallet integration**: Solana wallet adapter for crypto functionality

### Performance Optimizations
- **Image optimization**: Proper sizing and lazy loading
- **Animation performance**: CSS transforms over layout changes
- **Mobile-first**: Optimized for mobile devices primarily

### Accessibility
- **High contrast**: Proper color contrast ratios
- **Touch targets**: Minimum 44px for mobile interactions
- **Keyboard navigation**: Proper focus management
- **Screen reader support**: Semantic HTML and ARIA labels

## Cultural Considerations

### Islamic Values Integration
- **Modest fashion focus** in product categories
- **Prayer-related accessories** and spiritual items
- **Halal business practices** in shop policies
- **Cultural sensitivity** in design elements and imagery

### Arabic Design Elements
- **Geometric patterns** in decorative elements
- **Corner decorations** inspired by Islamic art
- **Calligraphy integration** in branding and headers
- **Traditional color palettes** with modern interpretation

## Future Enhancements

### Planned Features
- **Advanced matching algorithms** based on Islamic compatibility
- **Video call integration** for virtual meetings
- **Wedding planning tools** integrated with shopping
- **Community features** for Islamic events and gatherings
- **Multi-language support** including Arabic

### Design Evolution
- **Enhanced animations** for better user engagement
- **Advanced personalization** based on user preferences
- **Improved accessibility** features
- **Progressive web app** capabilities for better mobile experience

## Development Guidelines

### Code Organization
- **Component-based architecture** with reusable elements
- **Consistent naming conventions** following React best practices
- **Type safety** with TypeScript throughout
- **Responsive design** with mobile-first approach

### Quality Standards
- **Design consistency** across all components
- **Performance monitoring** for optimal user experience
- **Cross-browser compatibility** testing
- **Regular accessibility audits**

---

*Last updated: Current implementation includes complete shop system with Pinterest-style layout, enhanced categories, working edit functionality, and comprehensive business setup forms.*
