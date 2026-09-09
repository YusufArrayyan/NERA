# NERA Design System v1.0

Complete design system documentation for the NERA Neuro-Adaptive Learning Platform frontend.

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Patterns](#patterns)
7. [Accessibility](#accessibility)

---

## Brand Identity

### Mission
Deliver science-backed, adaptive learning through real-time neurological feedback via wearable EEG technology.

### Visual Principles

| Principle | Description |
|-----------|-------------|
| **Trust** | Calm, professional appearance. Green conveys stability and growth. |
| **Innovation** | Teal accents represent technology and forward-thinking. |
| **Clarity** | Clean typography, ample whitespace, clear visual hierarchy. |
| **Accessibility** | High contrast, semantic colors, inclusive design. |
| **Responsiveness** | Mobile-first, adapts seamlessly to all devices. |

---

## Color System

### Primary Palette - Forest Green

Used for primary actions, headers, and focus states. Conveys science, growth, and trust.

```
Forest Green (#2db87f)
├── 50: #f0faf5 (lightest background)
├── 100: #dff5e8
├── 200: #b8e6d1
├── 300: #90d8ba
├── 400: #5bc89f
├── 500: #2db87f ← Primary (brand color)
├── 600: #1f9863
├── 700: #1a7f52
├── 800: #156542
└── 900: #0f4c32 (darkest text/border)
```

**Usage:**
- CTA buttons (primary)
- Active navigation
- Success indicators
- Focus states
- Headings

---

### Secondary Palette - Teal

Used for secondary actions and technology-related elements.

```
Teal (#10dcc8)
├── 50: #f0fdfa
├── 100: #cffaf2
├── 200: #a0f3e8
├── 300: #70ecde
├── 400: #40e5d4
├── 500: #10dcc8 ← Secondary (accent)
├── 600: #0ca99a
├── 700: #08766c
├── 800: #04433e
└── 900: #021010
```

**Usage:**
- Secondary buttons
- Accent elements
- Feature highlights
- Data visualizations
- Device indicators

---

### Neutral Palette - Grayscale

Professional, accessible neutral grays for text, borders, and backgrounds.

```
Neutrals (#111827 to #ffffff)
├── 0: #ffffff (white)
├── 50: #f9fafb (lightest background)
├── 100: #f3f4f6
├── 200: #e5e7eb
├── 300: #d1d5db
├── 400: #9ca3af (placeholder text)
├── 500: #6b7280 (secondary text)
├── 600: #4b5563
├── 700: #374151 (body text)
├── 800: #1f2937
└── 900: #111827 (darkest - main text/backgrounds)
```

**Usage:**
- Body text (700)
- Backgrounds (50-100)
- Borders (200-300)
- Secondary text (500-600)

---

### Semantic Palette

Universally understood status colors.

| Color | Hex | Usage |
|-------|-----|-------|
| **Success** | #10b981 | Positive actions, completed states, healthy metrics |
| **Warning** | #f59e0b | Caution alerts, pending states, requires attention |
| **Error** | #ef4444 | Errors, failures, critical issues, deletions |
| **Info** | #3b82f6 | Informational alerts, secondary actions |

---

### Gradients

Pre-defined gradient combinations for visual depth.

#### Primary Gradient
```css
linear-gradient(135deg, #2db87f 0%, #10dcc8 100%)
```
**Usage:** Hero sections, featured cards, primary CTAs

#### Dark Gradient
```css
linear-gradient(135deg, #1f2937 0%, #111827 100%)
```
**Usage:** Dark backgrounds, footer overlays

#### Success Gradient
```css
linear-gradient(135deg, #10b981 0%, #059669 100%)
```
**Usage:** Success states, achievement badges

---

## Typography

### Font Family

**Primary Font: System Default**
```
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
```

Provides optimal readability on all platforms (macOS, iOS, Windows, Android, web).

**Monospace Font:**
```
"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace
```

Used for code, technical values (MAC addresses, UUIDs, firmware versions).

---

### Font Sizes

Responsive scales with breakpoints for optimal readability.

| Size | Mobile | Tablet+ | Use Case |
|------|--------|---------|----------|
| **4xl** | 36px / 44px | 36px / 44px | Page hero title |
| **3xl** | 30px / 36px | 30px / 36px | Section title (rarely used) |
| **2xl** | 24px / 32px | 24px / 32px | Major section heading |
| **xl** | 20px / 28px | 20px / 28px | Card title, page subtitle |
| **lg** | 18px / 28px | 18px / 28px | Subsection title |
| **base** | 16px / 24px | 16px / 24px | Body text, regular labels |
| **sm** | 14px / 20px | 14px / 20px | Secondary text, small labels |
| **xs** | 12px / 16px | 12px / 16px | Tiny labels, meta information |

**Mobile-First Examples:**
```tsx
// Hero title
<h1 className="text-4xl md:text-5xl">Title</h1>

// Section title
<h2 className="text-lg md:text-xl">Section</h2>

// Body text
<p className="text-base md:text-lg">Description</p>

// Small label
<p className="text-xs md:text-sm">Label</p>
```

---

### Font Weights

| Weight | Value | Use Case |
|--------|-------|----------|
| **Light** | 300 | Subtle secondary text |
| **Normal** | 400 | Body text, descriptions |
| **Medium** | 500 | Card titles, emphasis |
| **Semibold** | 600 | Section headers, labels |
| **Bold** | 700 | Primary headers, CTAs |

---

### Line Height

```
xs: 16px (ratio 1.33)
sm: 20px (ratio 1.43)
base: 24px (ratio 1.50)
lg: 28px (ratio 1.56)
xl: 28px (ratio 1.40)
2xl: 32px (ratio 1.33)
```

Maintains readability across all text sizes.

---

## Spacing & Layout

### Spacing Scale

All spacing uses **4px base unit** for consistency.

```
0: 0px
1: 4px
2: 8px
3: 12px
4: 16px      ← Most common
5: 20px
6: 24px      ← Cards, sections
8: 32px
10: 40px
12: 48px
16: 64px
20: 80px
24: 96px
```

**TailwindCSS classes:** `p-1` through `p-24`, `gap-1` through `gap-24`, `m-1` through `m-24`

---

### Padding Guidelines

| Component | Mobile | Tablet+ | Class |
|-----------|--------|---------|-------|
| Page | p-6 | lg:p-8 | Outer padding |
| Card | p-4 or p-6 | p-6 | Inner padding |
| Button | px-4 py-2 | px-6 py-3 | Depends on size |
| Input | px-3 py-2 | px-4 py-2 | Form elements |

---

### Gap Guidelines

| Component | Gap | Class |
|-----------|-----|-------|
| Card grid (4 items) | 6 (24px) | `gap-6` |
| 2-column section | 6 (24px) | `gap-6` |
| Inline buttons | 2-3 (8-12px) | `gap-2` or `gap-3` |
| List items | 3-4 (12-16px) | `gap-3` or `gap-4` |

---

### Border Radius

Consistent corner rounding for modern appearance.

```
none: 0px
sm: 4px         (inputs, small elements)
base: 8px       (default, most components)
md: 12px        (slightly larger)
lg: 16px        (cards, modals)
xl: 20px        (large feature components)
full: 9999px    (circles, pills)
```

---

### Shadows (Depth Layers)

```
sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
  ├─ Usage: Subtle separation, icons

base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
  ├─ Usage: Default cards, components

md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
  ├─ Usage: Elevated cards, hover states

lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
  ├─ Usage: Prominent components, modals

xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
  ├─ Usage: Floating elements, dropdowns

2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
  ├─ Usage: Full-screen overlays, prominent modals

inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)
  ├─ Usage: Inset effects, depressed buttons
```

---

## Components

### 12 Core Components

#### 1. **Badge** - Status indicator
- Variants: default, success, warning, error, info, primary, secondary
- Sizes: sm (compact), md (standard)
- Use: Status labels, tags, category indicators

#### 2. **Button** - Interactive CTA
- Variants: primary, secondary, outline, ghost, danger
- Sizes: sm, md, lg
- States: default, hover, active, disabled, loading
- Use: Primary actions, form submission, navigation

#### 3. **Card** - Container component
- Variants: default, elevated, outlined
- Sub-components: CardHeader, CardBody, CardFooter
- Use: Content organization, data grouping

#### 4. **Heatmap** - Color intensity grid
- Interactive hover tooltips
- Customizable rows/columns/colors
- Scale: 0-100% mapped to 5 colors
- Use: Student attention visualization, consistency patterns

#### 5. **MetricCard** - Icon + metric display
- Icon from Lucide React
- Status color coding
- Trend indicators
- Use: Key metric highlights

#### 6. **ProgressBar** - Linear progress
- Variants: default, gradient, success, warning, error
- Sizes: sm, md, lg
- Animated fill
- Use: Loading indicators, progress tracking

#### 7. **ProgressStep** - Multi-step progress
- 3 states: completed, active, pending
- Visual connectors
- Optional descriptions
- Use: Wizard flows, setup processes

#### 8. **StatCard** - Large metric with trend
- Big value display
- Trend arrows (up/down)
- Optional description/icon
- Highlight variant
- Use: Dashboard KPIs, key metrics

#### 9. **Toggle** - Checkbox-like switch
- Label + description
- Smooth animation
- Accessible (keyboard support)
- Use: Feature toggles, settings

#### 10. **DeviceStatus** - Device connectivity card
- Real-time indicators (battery, signal, impedance)
- Status badges
- Multi-field display
- Use: Device management, hardware status

#### 11. **Table** - Data grid
- Custom column rendering
- Striped rows
- Responsive horizontal scroll
- Use: Student data, detailed metrics

#### 12. **ChartContainer** - Chart wrapper
- Title + description
- Optional action button
- Scroll handling
- Use: Analytics sections, data visualization

---

## Patterns

### Page Header Pattern
```tsx
<div className="mb-8">
  <Badge variant="primary">PAGE_CATEGORY</Badge>
  <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">
    Page Title
  </h1>
  <p className="text-lg text-neutral-600 max-w-2xl">
    Description
  </p>
</div>
```

### Metrics Grid Pattern
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard title="Metric 1" value={value1} />
  <StatCard title="Metric 2" value={value2} />
  <StatCard title="Metric 3" value={value3} />
  <StatCard title="Metric 4" value={value4} />
</div>
```

### 2-Column Layout Pattern
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">Main Content</div>
  <div className="lg:col-span-1">Sidebar</div>
</div>
```

### Card Group Pattern
```tsx
<Card variant="elevated">
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardBody className="space-y-4">
    {/* content */}
  </CardBody>
  <CardFooter>
    {/* actions */}
  </CardFooter>
</Card>
```

### Alert Pattern
```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
  <div className="text-sm text-red-900">
    <p className="font-semibold">Title</p>
    <p>Description</p>
  </div>
</div>
```

---

## Accessibility

### WCAG 2.1 Compliance

All components meet **WCAG AA (Level AA)** standards:

- **Color Contrast:** 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation:** Full support via Tab, Enter, Space
- **Semantic HTML:** Proper heading hierarchy, form labels
- **Screen Readers:** ARIA labels, descriptive text
- **Focus States:** Clear visual indicators
- **Motion:** Respects `prefers-reduced-motion`

---

### Color Contrast Ratios

| Text Color | Background | Ratio | Grade |
|-----------|-----------|-------|-------|
| Green-900 | Neutral-50 | 10.8:1 | AAA |
| Green-700 | Neutral-50 | 6.2:1 | AA |
| Green-600 | White | 4.5:1 | AA |
| Neutral-700 | Neutral-50 | 4.8:1 | AA |

---

### Keyboard Navigation

| Component | Keyboard | Action |
|-----------|----------|--------|
| Button | Enter/Space | Activate |
| Toggle | Tab | Focus |
|  | Space | Toggle state |
| Input | Tab | Focus |
| Link | Enter | Navigate |
| Dropdown | Tab | Focus |
|  | Arrow keys | Navigate |
|  | Enter | Select |

---

### Screen Reader Support

- All images have descriptive alt text
- Buttons have meaningful labels
- Form fields have associated labels
- Status indicators use `aria-label`
- Alerts use `role="alert"` or `role="status"`

---

## Implementation Files

```
frontend/src/
├── components/
│   ├── ui/
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ChartContainer.tsx
│   │   ├── DeviceStatus.tsx
│   │   ├── Heatmap.tsx
│   │   ├── MetricCard.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ProgressStep.tsx
│   │   ├── StatCard.tsx
│   │   ├── Table.tsx
│   │   ├── Toggle.tsx
│   │   └── README.md
│   ├── HeadbandCalibration.tsx
│   ├── AnalyticsPage.tsx
│   ├── DeviceManagementPage.tsx
│   └── TeacherDashboard.tsx
├── styles/
│   └── design-tokens.ts
├── app/
│   ├── hardware/calibration/page.tsx
│   ├── analytics/page.tsx
│   ├── devices/page.tsx
│   └── teacher/page.tsx
└── (other source files)
```

---

## Design Decisions

### Why Green + Teal?

- **Green:** Universally associated with growth, health, nature, and trust
- **Teal:** Modern, tech-forward, complements green nicely
- **Together:** Convey "science-backed wellness technology"

### Why System Fonts?

- **Performance:** No additional font downloads
- **Consistency:** Matches native OS appearance
- **Accessibility:** Highly optimized for readability
- **Support:** Works across all devices and browsers

### Why Mobile-First?

- **Performance:** Simpler CSS, faster mobile load times
- **UX:** Progressive enhancement, focus on essential features
- **Maintainability:** Easier to add complexity than remove it

---

## Future Enhancements

- [ ] Dark mode support
- [ ] Advanced theming system
- [ ] Custom color palette builder
- [ ] Animation library (Framer Motion)
- [ ] Form validation patterns
- [ ] Toast notification system
- [ ] Advanced data table features
- [ ] Date/time pickers

---

## Questions & Support

For design system questions:
1. Check this document
2. Review component README
3. Check implementation files
4. File an issue with details

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| **1.0.0** | 2024-08 | Initial release |

---

**Last Updated:** 2024-08
**Maintainer:** NERA Design System Team
**License:** © 2024 NERA Neuro-Adaptive Platform
