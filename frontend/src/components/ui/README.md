# NERA UI Component Library

Modern, responsive component system for the NERA Neuro-Adaptive Learning Platform. Built with React 19, TailwindCSS 3.4, and Lucide React icons.

## Design System Overview

**Color Palette:**
- Primary: Forest Green (#2db87f) - Trust & Science
- Secondary: Teal (#10dcc8) - Technology & Innovation
- Semantic: Red (#ef4444), Orange (#f59e0b), Yellow (#fbbf24), Green (#10b981), Blue (#3b82f6)

**Typography:**
- Font Family: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI)
- Scales: xs (12px) → 4xl (36px)
- Weights: Light (300) → Bold (700)

**Spacing:** 4px increments (1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24)

**Responsive Breakpoints:**
- xs: 0px (mobile)
- sm: 640px (portrait tablet)
- md: 768px (tablet)
- lg: 1024px (desktop)
- xl: 1280px (wide desktop)

---

## Components

### Layout & Structure

#### **Card** `Card.tsx`
Base container component with three variants.

```tsx
<Card variant="default" | "elevated" | "outlined">
  <CardHeader>Header content</CardHeader>
  <CardBody>Main content</CardBody>
  <CardFooter>Footer content</CardFooter>
</Card>
```

**Variants:**
- `default`: Clean white with border
- `elevated`: Shadowed with hover effect
- `outlined`: Thick border, no shadow

**Sub-components:**
- `CardHeader`: Top section with border separator
- `CardBody`: Main padded area
- `CardFooter`: Bottom section with background (bg-neutral-50)

---

### Form & Input

#### **Button** `Button.tsx`
Versatile button component with 5 variants and 3 sizes.

```tsx
<Button 
  variant="primary" | "secondary" | "outline" | "ghost" | "danger"
  size="sm" | "md" | "lg"
  isLoading={false}
  disabled={false}
>
  Click me
</Button>
```

**Variants:**
- `primary`: Green background (primary CTA)
- `secondary`: Teal background (secondary CTA)
- `outline`: Green border, no fill
- `ghost`: Text only, minimal styling
- `danger`: Red background (destructive actions)

**Features:**
- Built-in loading state with spinner
- Disabled state with reduced opacity
- Smooth transitions and focus states

#### **Toggle** `Toggle.tsx`
Checkbox-like toggle switch with label and description.

```tsx
<Toggle
  checked={true}
  onChange={(checked) => console.log(checked)}
  label="Feature Name"
  description="Optional description"
  disabled={false}
/>
```

**Features:**
- Smooth transition animation
- Label + description support
- Disabled state handling

---

### Status & Indicators

#### **Badge** `Badge.tsx`
Compact status indicator with 7 variants.

```tsx
<Badge 
  variant="default" | "success" | "warning" | "error" | "info" | "primary" | "secondary"
  size="sm" | "md"
>
  Status text
</Badge>
```

**Variants:** color-coded (neutral/green/yellow/red/blue/green/teal)

**Sizes:** Compact (sm) or Standard (md)

#### **ProgressBar** `ProgressBar.tsx`
Linear progress indicator with animated fill.

```tsx
<ProgressBar
  value={75}
  max={100}
  label="Progress Label"
  variant="default" | "gradient" | "success" | "warning" | "error"
  size="sm" | "md" | "lg"
  showLabel={true}
  animated={true}
/>
```

**Features:**
- Customizable max value
- Color variants
- Optional label display
- Smooth animations

#### **ProgressStep** `ProgressStep.tsx`
Multi-step progress indicator with status visualization.

```tsx
<ProgressStep
  steps={[
    { number: 1, label: "Step 1", status: "completed", description: "Optional desc" },
    { number: 2, label: "Step 2", status: "active" },
    { number: 3, label: "Step 3", status: "pending" },
  ]}
  currentStep={2}
/>
```

**Features:**
- 3 status states: completed ✓, active (pulse), pending
- Optional descriptions
- Connecting lines between steps
- Checkmark icon on completion

---

### Data Display

#### **StatCard** `StatCard.tsx`
Large metric display with trend indicators.

```tsx
<StatCard
  title="Focus Rate"
  value={78}
  unit="%"
  change={{ value: 12, direction: "up", period: "vs last week" }}
  description="Optional description"
  icon="📊"
  variant="default" | "highlight"
/>
```

**Features:**
- Large value display
- Trend arrows (up/down with percentage)
- Optional icon
- Highlight variant with gradient background

#### **MetricCard** `MetricCard.tsx`
Icon-based metric with status color coding.

```tsx
<MetricCard
  icon={Signal}  // Lucide icon component
  label="Signal Strength"
  value={-42}
  unit="dBm"
  status="good" | "warning" | "error" | "neutral"
  trend="up" | "down" | "neutral"
  trendValue="+5 dBm"
  description="Signal quality"
/>
```

**Features:**
- Color-coded borders and backgrounds
- Icon backgrounds with semantic colors
- Status-based styling
- Trend indicators

#### **DeviceStatus** `DeviceStatus.tsx`
Comprehensive device connectivity card.

```tsx
<DeviceStatus
  name="NERA Headband #1"
  model="NERA-HB-8829"
  uuid="8F21-C99A-4527-E8B2"
  isConnected={true}
  batteryLevel={84}
  signalStrength={-42}
  lastSync="2 minutes ago"
  status="active" | "idle" | "error" | "updating"
  impedance={{ fp1: 0.8, fp2: 1.1, af7: 1.4, af8: 1.2 }}
/>
```

**Features:**
- Real-time connectivity status
- Battery percentage with estimated runtime
- Signal strength in dBm with quality label
- Optional 4-point impedance monitoring
- Status badges and warning alerts

#### **Heatmap** `Heatmap.tsx`
Color-intensity grid visualization.

```tsx
<Heatmap
  data={[[78, 82, 75], [85, 88, 92], [62, 58, 52]]}
  labels={{
    rows: ["Row 1", "Row 2", "Row 3"],
    cols: ["Col A", "Col B", "Col C"]
  }}
  title="Optional Title"
/>
```

**Color Scale:**
- 0-20%: Red
- 20-40%: Orange
- 40-60%: Yellow
- 60-80%: Green
- 80-100%: Dark Green

**Features:**
- Row and column labels
- Color legend
- Hover tooltips with values
- Interactive scaling

#### **Table** `Table.tsx`
Data grid with striped rows and custom rendering.

```tsx
<Table
  columns={[
    { key: "name", label: "Name", width: "w-32" },
    { 
      key: "focus", 
      label: "Focus Level", 
      render: (value) => <ProgressBar value={value} />
    },
    { key: "status", label: "Status" }
  ]}
  data={[
    { name: "John", focus: 85, status: "Active" },
    { name: "Jane", focus: 72, status: "Active" }
  ]}
  striped={true}
/>
```

**Features:**
- Custom column rendering
- Optional width specification
- Striped alternating rows
- Hover effects
- Responsive horizontal scroll

---

### Containers

#### **ChartContainer** `ChartContainer.tsx`
Wrapper for chart/graph sections.

```tsx
<ChartContainer
  title="Chart Title"
  description="Optional description"
  action={<Button>Action</Button>}
>
  {/* Chart content */}
</ChartContainer>
```

**Features:**
- Title and description
- Optional action button in header
- Automatic scroll on overflow

---

## Design Tokens

Located in `src/styles/design-tokens.ts`

### Color System
```typescript
colors: {
  primary: { 50-900 }, // Forest Green palette
  secondary: { 50-900 }, // Teal palette
  neutral: { 0-900 }, // Grayscale
  success, warning, error, info, // Semantic
  gradients: { primary, dark, success } // Pre-defined gradients
}
```

### Typography
```typescript
typography: {
  fontFamily: { base, mono },
  fontSize: { xs-4xl },
  fontWeight: { light, normal, medium, semibold, bold }
}
```

### Spacing
```typescript
spacing: { 0, 1-24 } // 4px increments
```

### Border Radius
```typescript
borderRadius: { none, sm, base, md, lg, xl, full }
```

### Shadows
```typescript
shadows: { none, sm, base, md, lg, xl, 2xl, inner }
```

### Z-Index
```typescript
zIndex: {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  offcanvas: 1050,
  modal: 1060,
  popover: 1070,
  tooltip: 1080
}
```

### Transitions
```typescript
transitions: {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out'
}
```

---

## Usage Examples

### Simple Metric Display
```tsx
<MetricCard
  icon={Battery}
  label="Battery"
  value={84}
  unit="%"
  status="good"
  description="~6.5 hours remaining"
/>
```

### Status Section
```tsx
<Card variant="elevated">
  <CardHeader>
    <h3 className="font-bold">Device Status</h3>
  </CardHeader>
  <CardBody className="space-y-4">
    <Badge variant="success">Connected</Badge>
    <ProgressBar value={85} label="Signal Quality" />
  </CardBody>
</Card>
```

### Data Display Table
```tsx
<Table
  columns={[
    { key: "name", label: "Student Name" },
    { 
      key: "focus",
      label: "Focus Level",
      render: (value) => (
        <div className="flex items-center gap-2">
          <ProgressBar value={value} showLabel={false} />
          <span>{value}%</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <Badge variant={value === "Active" ? "success" : "warning"}>{value}</Badge>
    }
  ]}
  data={studentData}
  striped={true}
/>
```

---

## Responsive Behavior

All components follow **mobile-first** design:

### Grid Layouts
- `grid-cols-1`: Mobile (default)
- `md:grid-cols-2`: Tablet and up
- `lg:grid-cols-3`: Desktop and up

### Spacing
- Base padding: 6 (24px)
- `md:p-8`: 32px on tablets and up

### Typography
- Base font: 16px (base)
- `md:text-lg`: 18px on tablets
- `md:text-2xl`: 24px on larger devices

### Cards
- Full width on mobile
- Side-by-side on lg+ (using `lg:col-span-2`)
- Sidebar on lg+ (using `lg:col-span-1`)

---

## Accessibility

### Color Contrast
All text meets WCAG AA standards (4.5:1 minimum)

### Keyboard Navigation
- Buttons: Full keyboard support with focus states
- Toggles: Tab navigation with space/enter activation
- Tables: Semantic HTML with proper structure

### Semantic HTML
- Proper heading hierarchy (h1, h2, h3)
- Form labels linked to inputs
- Icon buttons have `aria-label`

### Screen Readers
- Cards: Use `<section>` with descriptive headers
- Badges: Descriptive text in status indicators
- Progress: Percentage displayed as text

---

## Customization

### Colors
Modify `src/styles/design-tokens.ts` color values:
```typescript
primary: {
  500: '#2db87f', // Change primary color
}
```

### Spacing
Adjust `spacing` object for default component gaps:
```typescript
spacing: {
  4: '16px', // Change base spacing unit
}
```

### Shadows
Update `shadows` object for depth effects:
```typescript
shadows: {
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
}
```

---

## Dependencies

- **React 19.2.4**: UI library
- **TailwindCSS 3.4.1**: Utility-first CSS
- **Lucide React 1.23.0**: Icon library
- **Next.js 16.2.10**: Framework

---

## File Structure

```
src/components/
├── ui/
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── ChartContainer.tsx
│   ├── DeviceStatus.tsx
│   ├── Heatmap.tsx
│   ├── MetricCard.tsx
│   ├── ProgressBar.tsx
│   ├── ProgressStep.tsx
│   ├── StatCard.tsx
│   ├── Table.tsx
│   ├── Toggle.tsx
│   └── README.md (this file)
├── HeadbandCalibration.tsx
├── AnalyticsPage.tsx
├── DeviceManagementPage.tsx
└── TeacherDashboard.tsx
└── styles/
    └── design-tokens.ts
```

---

## Testing Pages

Access the following routes to view components:

- **Calibration & Alignment:** `/hardware/calibration`
- **Analytics & Learning:** `/analytics`
- **Device Management:** `/devices`
- **Teacher Dashboard:** `/teacher`

---

## Version History

- **v1.0.0** (2024-08): Initial release
  - 12 core components
  - 4 page templates
  - Complete design token system
  - Mobile-first responsive design
  - Indonesian localization

---

## Contributing

When adding new components:

1. Create file in `src/components/ui/`
2. Export from component
3. Use design tokens for colors/spacing
4. Include TypeScript interfaces
5. Test at multiple breakpoints
6. Update this README

---

## License

© 2024 NERA Neuro-Adaptive Platform. All rights reserved.
