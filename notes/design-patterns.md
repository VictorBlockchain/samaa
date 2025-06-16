# Samaa Design Patterns Reference

## Quick Reference for Consistent Design

### 1. Elegant Card Pattern (Primary)
**Use for all major content sections, coming soon messages, and feature displays**

```jsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  className="relative group mb-8"
>
  <div className="relative rounded-2xl p-8 border-2 border-indigo-300/20 hover:border-indigo-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/5 to-indigo-50/10">
    {/* Arabic-inspired corner decorations */}
    <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-xl"></div>
    <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-purple-400/60 rounded-tr-xl"></div>
    <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-purple-400/60 rounded-bl-xl"></div>
    <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-indigo-400/60 rounded-br-xl"></div>

    {/* Geometric pattern overlay */}
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-indigo-300/30 rounded-full opacity-20"></div>
    <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-purple-300/20 rounded-full"></div>
    <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-indigo-300/20 rounded-full"></div>

    <div className="relative z-10 text-center">
      {/* Content goes here */}
    </div>
  </div>
</motion.div>
```

### 2. Elegant Icon Pattern
**Use for all major section icons**

```jsx
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ delay: 0.3, duration: 0.6 }}
  className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-200/50"
>
  <Store className="w-10 h-10 text-indigo-600" />
</motion.div>
```

### 3. Typography Hierarchy
**Use this exact hierarchy for all content**

```jsx
{/* Main Title */}
<h3 className="text-3xl font-bold text-slate-800 mb-4 font-qurova">
  Main Section Title
</h3>

{/* Description with Gradient Highlight */}
<p className="text-lg text-slate-600 font-queensides leading-relaxed mb-6 max-w-sm mx-auto">
  Main description text with 
  <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
    highlighted important phrase
  </span> 
  continuing description.
</p>

{/* Section Header */}
<p className="text-base text-indigo-600 font-queensides font-semibold">
  Section header text:
</p>
```

### 4. Action Cards Grid Pattern
**Use for feature lists, preparation steps, and action items**

```jsx
<div className="grid grid-cols-1 gap-3 max-w-xs mx-auto">
  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200/50 shadow-sm">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
        <Store className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-queensides text-slate-700 font-semibold">Action description</span>
    </div>
  </div>
  
  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50 shadow-sm">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
        <Plus className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-queensides text-slate-700 font-semibold">Second action</span>
    </div>
  </div>
</div>
```

### 5. Trust Indicators Pattern
**Use for credibility elements at bottom of sections**

```jsx
<div className="flex justify-center space-x-4 text-sm">
  <div className="flex items-center space-x-2 text-indigo-600">
    <div className="w-2 h-2 bg-indigo-500/70 rounded-full"></div>
    <span className="font-queensides">Trust Element</span>
  </div>
  <div className="flex items-center space-x-2 text-purple-600">
    <div className="w-2 h-2 bg-purple-500/70 rounded-full"></div>
    <span className="font-queensides">Second Element</span>
  </div>
</div>
```

### 6. Elegant Divider Pattern
**Use for section separators and card closures**

```jsx
<div className="flex items-center justify-center mt-6">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
  <div className="mx-4 flex items-center space-x-1">
    <div className="w-1 h-1 bg-indigo-400/60 rounded-full"></div>
    <div className="w-2 h-2 border border-indigo-400/40 rounded-full flex items-center justify-center">
      <div className="w-0.5 h-0.5 bg-indigo-500/70 rounded-full"></div>
    </div>
    <div className="w-1 h-1 bg-purple-400/60 rounded-full"></div>
  </div>
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent"></div>
</div>
```

## Color Theme Reference

### Primary Themes
- **Indigo-Purple**: `indigo` → `purple` (Main business functions)
- **Blue-Indigo**: `blue` → `indigo` (Trust, orders, reliability)
- **Purple-Violet**: `purple` → `violet` (Premium features)

### Context-Specific Themes
- **Amber-Orange**: `amber` → `orange` (Warnings, wallet connection)
- **Green-Emerald**: `green` → `emerald` (Success, actions)
- **Pink-Rose**: `pink` → `rose` (Bride content)
- **Slate-Gray**: `slate` → `gray` (Neutral, men's content)

### Category Colors
- **Bride Fashion**: Pink (`pink` → `rose`)
- **Groom Fashion**: Blue (`blue` → `indigo`)
- **Women's Fashion**: Purple (`purple` → `violet`)
- **Men's Fashion**: Gray (`slate` → `gray`)
- **Wedding Gifts**: Green (`emerald` → `green`)
- **Accessories**: Amber (`amber` → `yellow`)

## Animation Standards

### Standard Entrance
```jsx
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8, ease: "easeOut" }}
```

### Icon Animation
```jsx
initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ delay: 0.3, duration: 0.6 }}
```

### Hover Effects
```jsx
hover:border-indigo-400/40
hover:shadow-lg
transition-all duration-300
```

## Content Guidelines

### Messaging Approach
1. **Islamic Values First**: Always emphasize halal practices
2. **Community Focus**: Reference Muslim community
3. **Professional Credibility**: Use verification badges
4. **Future-Focused**: "Coming Soon" for unreleased features
5. **Encouraging Tone**: Positive, motivating language

### Content Structure
1. **Icon + Title**: Large animated icon with clear title
2. **Main Description**: Compelling copy with gradient highlights
3. **Feature List**: Action cards showing benefits/steps
4. **Trust Elements**: Credibility indicators
5. **Elegant Divider**: Professional closing

## Implementation Checklist

### For Every New Section:
- [ ] Use elegant card pattern with appropriate theme colors
- [ ] Include Arabic-inspired corner decorations
- [ ] Add geometric pattern overlay
- [ ] Implement proper typography hierarchy
- [ ] Include animated icon with gradient background
- [ ] Add action cards for features/steps
- [ ] Include trust indicators
- [ ] Close with elegant divider
- [ ] Use appropriate entrance animations
- [ ] Ensure mobile-responsive design

### Color Selection:
- [ ] Choose appropriate theme based on content context
- [ ] Use gradient backgrounds consistently
- [ ] Apply proper opacity levels (50/50 to 50/30)
- [ ] Ensure proper contrast for accessibility
- [ ] Use theme colors for borders and decorations

### Animation Requirements:
- [ ] Entrance animation with y: 30 offset
- [ ] Icon animation with scale and delay
- [ ] Hover effects on interactive elements
- [ ] Smooth transitions (duration: 0.3-0.8s)
- [ ] Proper easing (easeOut for entrances)

---

*Use this reference for all future design implementations to maintain consistency and quality across the Samaa platform.*
