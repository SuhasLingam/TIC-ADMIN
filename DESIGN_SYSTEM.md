# TIC Admin Design System

Comprehensive documentation of the design, UI, styling, theme, and visual identity system used in the TIC Admin Dashboard.

---

## Table of Contents

1. [Color System](#color-system)
2. [Theme Architecture](#theme-architecture)
3. [Typography](#typography)
4. [Component Styling](#component-styling)
5. [Layout & Spacing](#layout--spacing)
6. [Interactive States](#interactive-states)
7. [Status & Tier Colors](#status--tier-colors)
8. [Email Template Styling](#email-template-styling)

---

## Color System

### Semantic Color Variables

The design uses CSS custom properties (CSS variables) for theming, allowing seamless dark/light mode switching.

| Variable | Light Mode | Dark Mode | Usage |
|----------|------------|-----------|-------|
| `--background` | `#f4f4f5` | `#0a0a0a` | Page background |
| `--foreground` | `#09090b` | `#ffffff` | Primary text color |
| `--surface` | `#ffffff` | `#111111` | Cards, panels, elevated surfaces |
| `--border` | `rgba(9, 9, 11, 0.08)` | `rgba(255, 255, 255, 0.08)` | Borders, dividers |

### Color Philosophy

- **Neutral palette**: All colors are derived from zinc/slate grays
- **High contrast**: Dark text on light bg (light mode), light text on dark bg (dark mode)
- **Subtle borders**: Low opacity borders create delicate visual separation
- **Accent colors**: Used sparingly for status, tiers, and interactive elements

---

## Theme Architecture

### Implementation Stack

```
next-themes (library)
    └── ThemeProvider component
        └── Manages dark/light class on <html>
            └── CSS variables reactively update
```

### Theme Toggle Component

**Location**: `src/components/ThemeToggle.tsx`

```tsx
<button className="flex items-center gap-3 px-3 py-2 rounded-md
                   hover:bg-[var(--foreground)]/5 transition-colors
                   text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] w-full">
    {theme === "dark" ? <Sun /> : <Moon />}
    {theme === "dark" ? "Light Mode" : "Dark Mode"}
</button>
```

### Theme Behavior

- **Default**: Dark mode
- **Transition**: Instant toggle (no CSS transition on theme change)
- **Persistence**: next-themes automatically persists user preference in localStorage
- **Hydration safety**: Uses `mounted` state to prevent flash of wrong theme

---

## Typography

### Font Families

| Purpose | Font | Source | CSS Variable |
|---------|------|--------|--------------|
| **Headings** | Neue Montreal Medium | Local (`/fonts/NeueMontreal-Medium.otf`) | `--font-heading` |
| **Body** | Nord Regular | Local (`/fonts/Nord-Regular.woff2`) | `--font-sans` |

### Font Configuration

```css
/* globals.css */
--font-sans: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
--font-heading: var(--font-heading), ui-sans-serif, system-ui, sans-serif;
```

### Type Scale

| Element | Size | Weight | Tracking | Usage |
|---------|------|--------|----------|-------|
| Page Title | `text-2xl sm:text-3xl` | Default | `tracking-tight` | Main page headers |
| Section Title | `text-[11px]` | Medium | `tracking-widest` | Section headers |
| Body Text | `text-sm` | Default | Normal | Paragraphs |
| Caption/Meta | `text-xs` | Default | Normal | Secondary info |
| Badge Text | `text-[10px]` | Medium | `tracking-wide` | Status/tier badges |
| Label Text | `text-[10px]` | Normal | `tracking-wider` | Form labels |

### Font Features

```css
body {
  font-feature-settings: "rlig" 1, "calt" 1;
}
```

- **rlig**: Required ligatures enabled
- **calt**: Contextual alternates enabled

---

## Component Styling

### Cards

All cards follow a consistent pattern:

```tsx
<div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
  {/* content */}
</div>
```

**Properties**:
- **Background**: `--surface` (white in light, #111 in dark)
- **Border**: `--border` (subtle, low opacity)
- **Radius**: `rounded-2xl` (16px border-radius)
- **Padding**: `p-5 sm:p-6` (20px mobile, 24px desktop)
- **Overflow**: `overflow-hidden` for nested content

### Buttons

#### Primary Button Pattern

```tsx
<button className="flex items-center gap-2 px-3 py-2 rounded-lg
                   text-xs font-medium border
                   border-[var(--foreground)]/15
                   bg-[var(--foreground)]/5
                   text-[var(--foreground)]/80
                   hover:bg-[var(--foreground)]/10
                   transition-colors">
  {/* content */}
</button>
```

#### Icon Button Pattern

```tsx
<button className="p-2 hover:bg-[var(--foreground)]/10 rounded-md transition-colors">
  <Icon className="w-4 h-4" />
</button>
```

### Inputs

```tsx
<input className="w-full bg-[var(--foreground)]/5
                  border border-[var(--border)]
                  rounded-lg px-3 py-2 text-xs
                  text-[var(--foreground)]
                  placeholder:text-[var(--foreground)]/25
                  outline-none
                  focus:border-[var(--foreground)]/20" />
```

**States**:
- **Default**: Semi-transparent background
- **Focus**: Border opacity increases
- **Placeholder**: 25% opacity
- **Disabled**: `opacity-40 cursor-not-allowed`

### Badges

```tsx
<span className="px-2.5 py-1 rounded-full text-[10px]
                 font-medium uppercase tracking-wide border">
  {/* content */}
</span>
```

---

## Layout & Spacing

### Grid System

- **Mobile**: Single column, stacked layout
- **Tablet**: 2-column grids where appropriate
- **Desktop**: Multi-column layouts with sidebar

### Spacing Scale

| Class | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Tight element grouping |
| `gap-2` | 8px | Related elements |
| `gap-3` | 12px | Section spacing |
| `gap-5` | 20px | Card spacing |
| `gap-6` | 24px | Major section separation |

### Responsive Breakpoints

| Breakpoint | Class | Width |
|------------|-------|-------|
| Mobile | Default | < 640px |
| Small | `sm:` | ≥ 640px |
| Medium | `md:` | ≥ 768px |
| Large | `lg:` | ≥ 1024px |
| Extra Large | `xl:` | ≥ 1280px |

### Layout Patterns

#### Dashboard Layout
```
┌─────────────────────────────────────┐
│ Sidebar (260px) │ Main Content      │
│                 │                   │
│ - Logo          │ - Header          │
│ - Nav           │ - Stats           │
│ - Settings      │ - Table/Cards     │
│ - Theme Toggle  │                   │
│ - Logout        │                   │
└─────────────────────────────────────┘
```

#### Detail Page Layout
```
┌─────────────────────────────────────┐
│ Back Navigation                     │
├─────────────────────────────────────┤
│ Banner (Avatar + Info + Status)     │
├───────────────────┬─────────────────┤
│ Main Content      │ Sidebar Actions │
│ - Startup Details │ - Email Actions │
│ - Primary Goal    │ - Custom Email  │
│ - Overview        │ - Status Update │
└───────────────────┴─────────────────┘
```

---

## Interactive States

### Hover States

```tsx
// Standard hover pattern
className="hover:bg-[var(--foreground)]/5 transition-colors"

// Stronger hover
className="hover:bg-[var(--foreground)]/10 transition-colors"

// Colored hover (status-specific)
className="hover:bg-green-500/20 transition-colors"
```

### Disabled States

```tsx
className="disabled:opacity-40 disabled:cursor-not-allowed"
```

### Loading States

```tsx
{isLoading ? (
  <Loader2 className="w-4 h-4 animate-spin" />
) : (
  <Icon />
)}
```

### Transition Utility

All interactive elements use:
```css
transition-colors duration-200 ease-in-out
```

---

## Status & Tier Colors

### Status Configuration

| Status | Background | Text | Border | Icon |
|--------|------------|------|--------|------|
| **Pending** | `bg-yellow-500/10` | `text-yellow-500` | `border-yellow-500/20` | Clock |
| **Reviewed** | `bg-blue-500/10` | `text-blue-400` | `border-blue-500/20` | - |
| **Approved** | `bg-green-500/10` | `text-green-500` | `border-green-500/20` | CheckCircle2 |
| **Rejected** | `bg-red-500/10` | `text-red-400` | `border-red-500/20` | XCircle |

### Tier Configuration

| Tier | Background | Text | Border | Accent Strip |
|------|------------|------|--------|--------------|
| **Trailblazer** | `bg-purple-500/10` | `text-purple-400` | `border-purple-500/20` | Purple (#a855f7) |
| **Visionary** | `bg-amber-500/10` | `text-amber-400` | `border-amber-500/20` | Amber (#f59e0b) |
| **Explorer** | `bg-blue-500/10` | `text-blue-400` | `border-blue-500/20` | Blue (#3b82f6) |

### Implementation Pattern

```tsx
const STATUS_CONFIG = {
    pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    reviewed: { label: "Reviewed", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    approved: { label: "Approved", color: "bg-green-500/10 text-green-500 border-green-500/20" },
    rejected: { label: "Rejected", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

// Usage
<span className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide border ${STATUS_CONFIG[status].color}`}>
  {STATUS_CONFIG[status].label}
</span>
```

---

## Email Template Styling

### Email Design System

All emails use a consistent dark-themed HTML email template.

### Base Styles

```html
<body style="
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #000000;
  color: #ffffff;
  -webkit-font-smoothing: antialiased;">
```

### Email Container

```html
<table width="100%" max-width="600" style="
  background-color: #09090b;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #27272a;">
```

### Typography Hierarchy

| Element | Size | Weight | Color | Usage |
|---------|------|--------|-------|-------|
| Brand Header | 24px | 500 | #ffffff | "The Incite Crew" |
| Heading | 22px | 400 | #ffffff | Email subject line |
| Body | 15px | 400 | #a1a1aa | Main content |
| Secondary | 15px | 400 | #71717a | Signatures |
| Footer | 11px | 400 | #52525b | Legal/disclaimers |

### Color Palette (Emails)

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#000000` | Email canvas |
| Card BG | `#09090b` | Content container |
| Border | `#27272a` | Card borders |
| Text Primary | `#ffffff` | Headings |
| Text Secondary | `#a1a1aa` | Body text |
| Text Muted | `#71717a` | Signatures |
| Text Footer | `#52525b` | Footer text |

### Tier Colors (Emails)

| Tier | Hex | Usage |
|------|-----|-------|
| Explorer | `#6366f1` | Indigo accent |
| Visionary | `#a855f7` | Purple accent |
| Trailblazer | `#d4af37` | Gold accent |

### Button Styling (Emails)

```html
<a href="#" style="
  display: inline-block;
  padding: 12px 24px;
  background-color: #ffffff;
  color: #000000;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: 4px;">
  CTA Text
</a>
```

---

## Icon System

### Library: Lucide React

All icons from `lucide-react` package.

### Icon Sizing

| Context | Size Class | Dimensions |
|---------|------------|------------|
| Navigation | `w-4 h-4` | 16x16 |
| Buttons | `w-3.5 h-3.5` | 14x14 |
| Stats | `w-4 h-4` | 16x16 |
| Hero Avatar | `w-16 h-16` | 64x64 |
| Mobile Menu | `w-5 h-5` | 20x20 |

### Icon Opacity

```tsx
// Default icon opacity
className="w-4 h-4 opacity-60"

// Hover state
className="opacity-40 hover:opacity-100"

// Disabled state
className="opacity-30"
```

### Common Icons

| Icon | Usage |
|------|-------|
| `Mail` | Applications, email actions |
| `Users` | Users section |
| `Settings` | Settings page |
| `Menu` / `X` | Mobile navigation |
| `LogOut` | Logout button |
| `Sun` / `Moon` | Theme toggle |
| `Search` | Search input |
| `Eye` | View/open action |
| `Loader2` | Loading states |
| `Clock` | Pending status |
| `CheckCircle2` | Approved status |
| `XCircle` | Rejected status |
| `Send` | Send email actions |
| `PenLine` | Custom email |
| `Globe` | Website links |
| `FileText` | Pitch deck |
| `Phone` | Mobile number |
| `Building2` | Company name |
| `Target` | Founder stage |
| `DollarSign` | Revenue |
| `ArrowLeft` | Back navigation |

---

## Animation & Motion

### Transitions

```css
/* Global transition utility */
transition-colors duration-200 ease-in-out

/* Sidebar transition */
transition-transform duration-200

/* Theme transition (body) */
transition-colors duration-500 ease-in-out
```

### Loading Animation

```tsx
<Loader2 className="w-4 h-4 animate-spin" />
```

### Hover Transformations

No scale/translate transforms used. Only color/opacity changes for subtle interactions.

---

## Accessibility

### Color Contrast

- **Light mode**: `#09090b` on `#f4f4f5` (WCAG AAA)
- **Dark mode**: `#ffffff` on `#0a0a0a` (WCAG AAA)

### Focus States

```tsx
className="outline-none focus:border-[var(--foreground)]/20"
```

### Screen Reader Considerations

- All icons have `aria-hidden` implicitly (decorative)
- Buttons have descriptive text labels
- Links have meaningful anchor text

---

## Design Principles

1. **Minimalism**: No decorative elements without purpose
2. **Consistency**: Same patterns repeated across all components
3. **Clarity**: High contrast, readable typography
4. **Subtlety**: Low-opacity borders, muted secondary text
5. **Function-first**: Every visual element serves a UX purpose
6. **Dark-first**: Default dark mode, light mode as alternative
7. **Neutral base**: Accent colors only for status/tier differentiation

---

## File Locations

| Asset | Path |
|-------|------|
| Global Styles | `src/styles/globals.css` |
| Theme Provider | `src/components/theme-provider.tsx` |
| Theme Toggle | `src/components/ThemeToggle.tsx` |
| Fonts | `src/public/fonts/` |
| Logo | `public/logo/ticlogo.svg` |
| Dashboard Layout | `src/app/(dashboard)/layout.tsx` |
| Main Page | `src/app/(dashboard)/page.tsx` |
| Detail Page | `src/app/(dashboard)/applications/[id]/page.tsx` |

---

*Generated from TIC Admin Dashboard source code. Last updated: 2026-03-16*
