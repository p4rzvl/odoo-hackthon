# DESIGN.md — Official Odoo ERP Theme

Based on Odoo's official brand colors and default ERP interface.

---

## Official Odoo Brand Colors

From Odoo's official brand assets: https://www.odoo.com/page/brand-assets

- Odoo Primary (Purple): **#714B67**
- Odoo Gray: **#8F8F8F**

---

## Design Tokens

### Colors

#### Primary Palette (Odoo Official)

- Primary: #714B67 (Odoo Purple)
- Primary Light: #9e7592 (lighter purple for hover)
- Primary Dark: #5a3c52 (darker purple for active)

#### Secondary Palette (Grays)

- Gray: #8F8F8F (Odoo official gray)
- Gray Light: #f8f9fa (background)
- Gray Medium: #e5e5e5 (borders)
- Gray Dark: #212529 (text)

#### Status Colors

- Success: #10b981 (Emerald green)
- Warning: #f59e0b (Amber)
- Danger: #dc2626 (Crimson red)
- Info: #3b82f6 (Blue)

#### Background & Text

- Background: #f8f9fa (light gray)
- Surface: #ffffff (white)
- Text Primary: #212529 (dark)
- Text Muted: #6b7280 (gray)

---

## Typography

### Font Family

- **Primary Font**: Inter, Outfit, or system-ui
- **Fallback**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial

### Font Weights

- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Font Sizes

H1: 2rem (32px)
H2: 1.75rem (28px)
H3: 1.5rem (24px)
H4: 1.25rem (20px)
H5: 1.125rem (18px)
Body: 1rem (16px)
Small: 0.875rem (14px)

text

---

## Key Layout Patterns

### 1. Sidebar Navigation (ERP Style)

┌────────────────┐
│ Odoo Logo │
├────────────────┤
│ Dashboard │
│ Sales │
│ Inventory │
│ Accounting │
│ Settings │
└────────────────┘

text

**Properties:**

- Position: Fixed left
- Width: 250px
- Background: #ffffff (white)
- Border-right: 1px solid #e5e5e5
- Active item:
  - Background: #714B67 (Odoo Purple)
  - Text: White
  - Icon: White
- Hover item:
  - Background: #f8f9fa
  - Text: #212529

---

### 2. Topbar (Header)

┌──────────────────────────────────────────────┐
│ Breadcrumbs │ Search │ 📧 👤 ⚙️ │
└──────────────────────────────────────────────┘

text

**Properties:**

- Position: Fixed top
- Height: 60px
- Background: #ffffff
- Border-bottom: 1px solid #e5e5e5
- Components:
  - Breadcrumbs: Left, gray text
  - Search: Center, light gray input
  - Icons: Right (notifications, user profile, settings)
- User profile:
  - Round avatar
  - Dropdown menu

---

### 3. Dashboard Cards (Metrics)

┌─────────────────┐
│ 📊 Total Sales │
│ $123,456 │
│ ↑ 12% this wk │
└─────────────────┘

text

**Properties:**

- Grid: Auto-fit, min 280px
- Background: #ffffff
- Border: 1px solid #e5e5e5
- Rounded: 8px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Padding: 16px
- Icon: Top-left, 24px, #714B67
- Metric value:
  - Font-size: 24px
  - Font-weight: 700
  - Color: #212529
- Label:
  - Font-size: 14px
  - Color: #6b7280
- Trend:
  - Green: #10b981 (↑ positive)
  - Red: #dc2626 (↓ negative)

---

### 4. Data Tables (ERP List Views)

┌────────────────────────────────────────────┐
│ [Search] [Filter] [Group By] [+ New] │
├────────────────────────────────────────────┤
│ ID │ Name │ Status │ Amount │ Date │
│────┼─────────┼─────────┼─────────┼────────│
│ 1 │ Order 1 │ Paid │ $1200 │ Jan 1 │
│ 2 │ Order 2 │ Pending │ $800 │ Jan 2 │
├────────────────────────────────────────────┤
│ 10 items │ │ Next → │

└────────────────────────────────────────────┘

text

**Properties:**

- Border: 1px solid #e5e5e5
- Rounded: 8px
- Header:
  - Background: #f8f9fa
  - Font-weight: 600
  - Color: #212529
- Rows:
  - Background: #ffffff
  - Border-bottom: 1px solid #e5e5e5
  - Hover: #f9f9f9
- Actions:
  - Right-aligned buttons
  - Edit, Delete, View
- Status badges:
  - Paid: #10b981 (green)
  - Pending: #f59e0b (amber)
  - Cancel: #dc2626 (red)
- Pagination:
  - Bottom bar
  - Item count
  - Page numbers
  - Next/Prev buttons

---

## Visual Theme & Atmosphere

- **Background**: Light (#f8f9fa)
- **Brand Accent**: Strong purple (#714B67)
- **Density**: Moderate (not too tight, not too loose)
- **Style**: Friendly but professional ERP dashboard

---

## Component Stylings

### Buttons

#### Primary Button

Background: #714B67
Text: White
Rounded: 6px
Padding: 8px 16px
Font-weight: 600
Hover: #9e7592
Active: #5a3c52

text

#### Secondary Button

Background: White
Border: 1px solid #d1d5db
Text: #212529
Rounded: 6px
Padding: 8px 16px
Font-weight: 600
Hover: #f8f9fa

text

#### Danger Button

Background: #dc2626
Text: White
Rounded: 6px
Padding: 8px 16px
Hover: #b91c1c

text

---

### Cards

Background: #ffffff
Border: 1px solid #e5e5e5
Rounded: 8px
Shadow: 0 1px 3px rgba(0,0,0,0.1)
Padding: 16px

text

---

### Inputs

Border: 1px solid #d1d5db
Rounded: 6px
Padding: 8px 12px
Font-size: 14px
Focus:
Border: #714B67
Box-shadow: 0 0 0 2px rgba(113, 75, 103, 0.2)

text

---

### Alerts

#### Success Alert

Background: #d1fae5
Border: 1px solid #10b981
Text: #065f46

text

#### Warning Alert

Background: #fef3c7
Border: 1px solid #f59e0b
Text: #92400e

text

#### Danger Alert

Background: #fee2e2
Border: 1px solid #dc2626
Text: #991b1b

text

---

## Do's and Don'ts

### ✅ Do's

- Use #714B67 (Odoo Purple) for primary actions and highlights
- Keep layout clean and professional
- Use consistent spacing (8px, 16px, 24px, 32px)
- Use Inter/system-ui for modern, clean typography
- Use gray neutrals for borders and backgrounds

### ❌ Don'ts

- Overuse gradients
- Use too many colors
- Make it too dense or cluttered
- Hardcode colors — use SCSS variables
- Use decorative shadows

---

## Responsive Behavior

### Mobile (< 768px)

- Sidebar: Collapsible drawer (hamburger menu)
- Cards: 1 column
- Tables: Horizontal scroll
- Topbar: Simplified (hide breadcrumbs, keep search + profile)

### Tablet (768px – 1024px)

- Sidebar: Full width
- Cards: 2 columns
- Tables: Full width

### Desktop (> 1024px)

- Sidebar: Fixed 250px
- Cards: Auto-fit, min 280px
- Tables: Full width

---
