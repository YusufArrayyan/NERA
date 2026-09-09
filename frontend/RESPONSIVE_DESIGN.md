# NERA Responsive Design Guide

This document outlines responsive breakpoints, mobile-first patterns, and testing procedures for the NERA platform.

---

## Breakpoints

Based on TailwindCSS standard breakpoints:

| Breakpoint | Device Type | Min Width | Max Width | Use Case |
|------------|-------------|-----------|-----------|----------|
| **xs** | Mobile | 0px | 639px | Small phones (320-639px) |
| **sm** | Mobile | 640px | 767px | Large phones (640-767px) |
| **md** | Tablet | 768px | 1023px | Tablet portrait/landscape |
| **lg** | Desktop | 1024px | 1279px | Small laptops |
| **xl** | Desktop | 1280px | 1535px | Standard laptops |
| **2xl** | Desktop+ | 1536px | ∞ | Large monitors |

---

## Mobile-First Approach

All components use **mobile-first CSS** with `md:` and `lg:` prefixes:

```tsx
// Default: Mobile (0px+)
<div className="p-4 grid grid-cols-1 text-base">

// Tablet+: 768px
<div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 text-base md:text-lg">

// Desktop+: 1024px
<div className="p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 text-base md:text-lg lg:text-xl">
```

### Why Mobile-First?

1. Simpler CSS (no need to undo styles)
2. Better mobile performance (fewer styles)
3. Progressive enhancement approach
4. Matches typical user navigation patterns

---

## Page Layouts

### Single Column (Mobile)
```
┌─────────────────┐
│    Header       │ (full width)
├─────────────────┤
│                 │
│    Content      │ (full width)
│                 │
├─────────────────┤
│   Content       │
│                 │
├─────────────────┤
│    Footer       │
└─────────────────┘
```

**CSS:** `grid-cols-1` (default)

---

### Two Column (Tablet+)
```
┌──────────────────────────┐
│         Header           │ (full width)
├──────────────────────────┤
│          Main            │ Main Content
│          (60-70%)        │
│                          ├──────────────┤
│                          │   Sidebar    │
│                          │   (30-40%)   │
├──────────────────────────┤
│        Footer            │ (full width)
└──────────────────────────┘
```

**CSS:** `md:grid-cols-2` or `lg:grid-cols-3` with `lg:col-span-2`

---

### Three Column (Desktop+)
```
┌────────────────────────────────────────────┐
│               Header                       │
├────────────────────────────────────────────┤
│                    │         │             │
│   Left Sidebar     │  Main   │   Right     │
│    (20-25%)        │  (50%)  │  Sidebar    │
│                    │         │   (25%)     │
│                    │         │             │
├────────────────────────────────────────────┤
│              Footer                        │
└────────────────────────────────────────────┘
```

**CSS:** `lg:col-span-2` for main, `lg:col-span-1` for sidebars

---

## Component Responsive Patterns

### Card Grids
```tsx
// Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

### Table Responsive
```tsx
// Mobile: Vertical scrolling
// Tablet+: Horizontal scrolling on overflow
<div className="overflow-x-auto">
  <table className="w-full">
    {/* Automatically scrolls on small screens */}
  </table>
</div>
```

### Navigation
```tsx
// Mobile: Hamburger menu or vertical stack
// Desktop: Horizontal navigation
<nav className="flex flex-col md:flex-row gap-2 md:gap-4">
  <Button>Option 1</Button>
  <Button>Option 2</Button>
</nav>
```

### Modal/Sidebar
```tsx
// Mobile: Full screen
// Desktop: Partial width (25-33%)
<div className="fixed inset-0 md:static md:w-1/3">
  {/* Sidebar content */}
</div>
```

---

## Spacing Responsive

### Padding
```tsx
// Mobile: 6 (24px)
// Tablet: 6 (24px)
// Desktop: 8 (32px)
<div className="p-6 md:p-6 lg:p-8">
  {content}
</div>
```

### Gaps (between items)
```tsx
// Mobile: gap-4 (16px)
// Desktop: gap-6 (24px)
<div className="flex gap-4 lg:gap-6">
  {items}
</div>
```

### Margins
```tsx
// Mobile: mb-6 (24px)
// Desktop: mb-8 (32px)
<section className="mb-6 lg:mb-8">
  {content}
</section>
```

---

## Typography Responsive

### Headings
```tsx
// Calibration page hero
<h1 className="text-4xl md:text-5xl font-bold">
  Kalibrasi & Penyelarasan Headband NERA
</h1>

// Card titles
<h2 className="text-lg md:text-xl font-bold">
  Status Perangkat
</h2>

// Section titles
<h3 className="text-base md:text-lg font-bold">
  Panduan Fisik
</h3>
```

### Body Text
```tsx
// Description text
<p className="text-base md:text-lg text-neutral-600">
  {description}
</p>

// Small labels
<p className="text-xs md:text-sm font-medium">
  {label}
</p>
```

---

## Responsive Pages Implemented

### 1. Calibration & Alignment (`/hardware/calibration`)
- **Mobile (xs-sm):** Single column, stacked cards
- **Tablet (md):** Main content + sidebar (stacked on md)
- **Desktop (lg+):** 2-column layout with main + sidebar

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">Main content</div>
  <div className="lg:col-span-1">Sidebar</div>
</div>
```

### 2. Analytics (`/analytics`)
- **Mobile:** Full-width charts with vertical scrolling
- **Tablet:** 2-column layout
- **Desktop:** 3-column with heatmap + sidebar

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
  <div className="lg:col-span-2">Heatmap & charts</div>
  <div className="lg:col-span-1">Recommendations & missions</div>
</div>
```

### 3. Device Management (`/devices`)
- **Mobile:** Single column
- **Tablet:** Device list + settings
- **Desktop:** 2-column with main + sidebar controls

### 4. Teacher Dashboard (`/teacher`)
- **Mobile:** Metrics stacked, heatmap scrollable
- **Tablet:** 2-column layout
- **Desktop:** 3-column with table + sidebar alerts

---

## Testing Checklist

### Device Testing

| Device | Resolution | Browser | Orientation |
|--------|-----------|---------|-------------|
| iPhone 12 | 390x844 | Safari | Portrait |
| iPhone 14 Pro | 430x932 | Safari | Portrait |
| Galaxy S21 | 360x800 | Chrome | Portrait |
| iPad Air | 820x1180 | Safari | Portrait & Landscape |
| iPad Pro | 1024x1366 | Safari | Portrait & Landscape |
| MacBook Air | 1440x900 | Chrome | Landscape |
| Desktop 4K | 3840x2160 | Chrome | Landscape |

### Browser Compatibility

- ✅ Safari 15+ (iOS & macOS)
- ✅ Chrome 90+ (desktop & mobile)
- ✅ Firefox 88+
- ✅ Edge 90+

### Testing Procedures

#### 1. **Visual Regression Testing**
```bash
# Start dev server
npm run dev

# Test at each breakpoint:
# - 320px (xs - small phone)
# - 640px (sm - large phone)
# - 768px (md - tablet)
# - 1024px (lg - desktop)
# - 1440px (xl - laptop)
```

#### 2. **Layout Testing**
- [ ] All cards render without horizontal scroll on mobile
- [ ] Text doesn't overflow containers
- [ ] Images scale proportionally
- [ ] Buttons remain clickable (min 44px height)
- [ ] Spacing consistent across breakpoints

#### 3. **Interaction Testing**
- [ ] Buttons work on touch devices
- [ ] Toggles are easy to interact with
- [ ] Dropdowns don't overflow viewport
- [ ] Tables scroll horizontally on small screens
- [ ] Forms are keyboard accessible

#### 4. **Performance Testing**
- [ ] Page loads in < 3s on 4G
- [ ] Smooth scrolling (60fps)
- [ ] No layout shift on images/charts
- [ ] Animations perform well on mobile

---

## Common Responsive Issues & Solutions

### Issue: Text Overflow in Cards
```tsx
// ❌ Bad
<p className="text-lg font-bold">{longText}</p>

// ✅ Good
<p className="text-base md:text-lg font-bold truncate">
  {longText}
</p>
```

### Issue: Heatmap Too Small on Mobile
```tsx
// ❌ Bad - always full size
<Heatmap data={data} />

// ✅ Good - scrollable on mobile
<div className="overflow-x-auto">
  <Heatmap data={data} />
</div>
```

### Issue: Sidebar Overlaps Content
```tsx
// ❌ Bad - fixed width always
<div className="grid grid-cols-3">
  <main className="col-span-2" />
  <aside className="col-span-1" />
</div>

// ✅ Good - responsive columns
<div className="grid grid-cols-1 lg:grid-cols-3">
  <main className="lg:col-span-2" />
  <aside className="lg:col-span-1" />
</div>
```

### Issue: Button Too Small for Touch
```tsx
// ❌ Bad
<button className="px-2 py-1">Click</button>

// ✅ Good - min 44px height
<Button size="md" className="px-4 py-2">Click</Button>
```

---

## Next Steps for Mobile Optimization

### Phase 1 (Current)
- [x] Desktop-first breakpoints
- [x] Mobile-first CSS approach
- [x] Responsive page layouts
- [x] Touch-friendly buttons (44px minimum)

### Phase 2 (Planned)
- [ ] Create mobile-specific navigation (hamburger menu)
- [ ] Optimize images for different densities
- [ ] Implement viewport meta tags
- [ ] Add PWA support
- [ ] Test on real devices

### Phase 3 (Future)
- [ ] Dark mode support
- [ ] Landscape mode optimization
- [ ] Tablet-specific layouts
- [ ] Performance optimizations
- [ ] Mobile app wrapper (React Native)

---

## Resources

- [TailwindCSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [BrowserStack Responsive Testing](https://www.browserstack.com/responsive)

---

## Questions & Support

For responsive design issues:
1. Check this guide first
2. Use Chrome DevTools responsive mode
3. Test on physical devices
4. File issue with device/resolution info
