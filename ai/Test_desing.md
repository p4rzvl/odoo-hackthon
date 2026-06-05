DESIGN.md — Official Odoo ERP Theme Specifications

Version: 19.0.1.0.0

Standard: Odoo 19.0 Enterprise & Community CSS Framework (Bootstrap 5.3-based)

1. Executive Summary & Design Philosophy

This document establishes the UI/UX design specifications for the official Odoo ERP theme. Designed for high-density transactional environments, this theme blends Odoo's signature corporate purple accent with clean, low-fatigue layout patterns typical of enterprise database systems.

The primary goals are:

Brand Compliance: Uniform integration of the official Odoo Purple (#714B67) across digital interfaces.

Low-Cognitive Load: Leveraging high contrast, ample white space, and logical grid alignment for continuous, multi-hour ERP usage.

Performance-First styling: Fully aligned with the Odoo 19.0 dynamic SCSS asset compiler, avoiding layout shifts (CLS) and unused CSS overhead.

2. Core Color & Token System

All color tokens are bound to custom SCSS variables designed to integrate into Odoo’s dynamic palette compiler. Do not use raw HEX codes in custom stylesheets.

A. Brand Identity Colors

// Brand tokens
$o-brand-primary: #714B67;    // Official Odoo Purple
$o-brand-light: #9e7592; // Hover and soft states
$o-brand-dark:    #5a3c52;    // Active and pressed states
$o-brand-gray: #8F8F8F; // Official auxiliary neutral gray

B. Functional & System Semantics

These status tokens represent transactional validation across invoice pipelines, inventory status records, and form alerts:

Success (Confirmed / Paid): #10b981 (Emerald Green)

Warning (Awaiting Validation / Draft): #f59e0b (Amber Gold)

Danger (Cancelled / Out of Stock): #dc2626 (Crimson Red)

Info (Draft Inquiries / General): #3b82f6 (System Blue)

C. Surface & Structural Grays

Body Background: #f8f9fa (Low-glare neutral white/gray)

Surface Background: #ffffff (Pure white for cards, sheets, forms)

Border Lines: #e5e5e5 (Light neutral gray)

Text - Primary Dark: #212529 (High contrast charcoal)

Text - Muted Secondary: #6b7280 (Cool gray for captions and metadata)

3. Typography & Sizing Scale

The system typography utilizes clean, modern geometric sans-serif fonts optimized for both technical metrics tracking and clean textual readability.

Primary Font Stack: Inter, Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

Monospace Stack (for system IDs, Order Refs, Code): SFMono-Regular, Consolas, "Liberation Mono", monospace

Name

Rem Value

Pixel Equivalent

Weight (Standard/Bold)

Use Case

H1

2.00rem

32px

Bold (700)

Landing headers, metric highlights

H2

1.75rem

28px

Semibold (600)

Secondary module headers

H3

1.50rem

24px

Semibold (600)

Section titles, modal headers

H4

1.25rem

20px

Medium (500)

Dashboard card titles

H5

1.125rem

18px

Medium (500)

Mini widgets, sub-section headers

Body

1.00rem

16px

Normal (400)

Table records, paragraph blocks

Small

0.875rem

14px

Medium (500)

Badges, sidebar text, form labels

Micro

0.75rem

12px

Normal (400)

Tooltips, metadata, footer notes

4. Odoo 19.0 Asset Compilation Strategy

To prevent visual conflicts with other installed Odoo modules, your SCSS variables must register inside the framework's assets bundle hook pipeline:

# From **manifest**.py asset registration reference:

'assets': {
'web.\_assets_primary_variables': [
'website_odoo_erp/static/src/scss/primary_variables.scss',
],
'web.\_assets_frontend_helpers': [
'website_odoo_erp/static/src/scss/bootstrap_overridden.scss',
],
'web.assets_frontend': [
'website_odoo_erp/static/src/scss/theme.scss',
'website_odoo_erp/static/src/js/theme.js',
],
}

SCSS Palette Customization Key (primary_variables.scss)

Odoo's theme engine uses a specialized mapping structure. Override the default palette index safely by injecting colors directly:

$o-color-palettes: (
'primary': #714B67,
'secondary': #8F8F8F,
'success': #10b981,
'danger': #dc2626,
'warning': #f59e0b,
'info': #3b82f6
);

5. Blueprint Layout Guidelines

A. Sidebar Navigation Menu

Behavior: Persistent on desktop and tablet viewport width ($\ge 768\text{px}$). Transformed into a sliding off-canvas drawer on small screen viewports ($< 768\text{px}$).

Dimensions: Width 250px.

Border: Right boundary border 1px solid #e5e5e5.

State Mapping:

Default State: Transparent background, dark text #212529, left padding 16px.

Hover State: Background light grey #f8f9fa, text morphs to $o-brand-primary.

Active Selection State: Background $o-brand-primary (#714B67), text becomes pure white #ffffff, rounded border 6px.

B. Topbar Control Panel

Dimensions: Fixed height 60px.

Alignment: Flexible flexbox row spacing layout (justify-content: space-between).

Visual Elements:

Breadcrumbs: Left-aligned. Text color #6b7280. Displays logical navigation trails (e.g., Home / Sales / Invoices).

Search: Centered text input block, 6px border-radius, background #f8f9fa with an integrated magnifying glass icon.

Toolbar Icons: Right-aligned notification bubbles, user profile avatars, and setting buttons.

C. Dashboard KPI Cards

Grid Pattern: Flex-wrap or Auto-fit responsive CSS grid layout ($\text{minimum width} \ge 280\text{px}$).

Attributes:

Solid white background #ffffff, border boundary 1px solid #e5e5e5, rounded radius 8px.

Shadow box configuration: 0 1px 3px rgba(0,0,0,0.1).

Inline metric numbers: font size 24px (1.5rem), bold weight, colored in pure dark charcoal #212529.

D. Data List Tables

Structure: High-density, borders set on row limits with no vertical separators.

Header Row: Background color #f8f9fa, bold headings, text size 12px to 14px, text aligned to the left (with currency/price actions aligned right).

Row Interactions: Striped alternate backgrounds (white to #f9f9f9). Row hovers trigger background shifting to #e5e5e5/35.

6. Implementation Checklist (Do’s and Don’ts)

✅ Recommended Patterns

Dynamic Values Integration: Use SCSS variables ($o-brand-primary) instead of static CSS properties.

Explicit Dimension Definitions: Declare fixed dimensions (width, height) on images and svg elements to prevent cumulative layout shifts (CLS).

Contrast Compliance: Ensure that any text placed over primary colored containers retains a contract ratio of at least $4.5:1$ under accessibility standards.

Odoo Event Listeners: Write custom JS initializers inside odoo.define() scopes rather than binding directly to standard window.onload global event handlers.

❌ Patterns to Avoid

Hardcoded Color Injections: Do not write explicit HEX strings in custom utility stylesheets.

Framework Overrides: Avoid writing !important flags inside custom layouts; prioritize modifying Bootstrap variable configuration parameters first.

Redundant Stylesheet Declarations: Never load duplicate copies of icon libraries (e.g., FontAwesome) if they are already bundled within standard core website modules.
