---
name: Chez Gourmet - Smart Canteen
colors:
  surface: '#fff8f6'
  surface-dim: '#ffd0bb'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1eb'
  surface-container: '#ffeae1'
  surface-container-high: '#ffe2d6'
  surface-container-highest: '#ffdbcb'
  on-surface: '#2e1508'
  on-surface-variant: '#594238'
  inverse-surface: '#47291a'
  inverse-on-surface: '#ffede6'
  outline: '#8c7166'
  outline-variant: '#e0c0b2'
  surface-tint: '#a23f00'
  primary: '#a23f00'
  on-primary: '#ffffff'
  primary-container: '#f26b21'
  on-primary-container: '#511c00'
  inverse-primary: '#ffb595'
  secondary: '#3d6838'
  on-secondary: '#ffffff'
  secondary-container: '#bdf0b2'
  on-secondary-container: '#426f3d'
  tertiary: '#615e55'
  on-tertiary: '#ffffff'
  tertiary-container: '#98948a'
  on-tertiary-container: '#2f2d25'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb595'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7c2e00'
  secondary-fixed: '#bdf0b2'
  secondary-fixed-dim: '#a2d398'
  on-secondary-fixed: '#002202'
  on-secondary-fixed-variant: '#255022'
  tertiary-fixed: '#e8e2d6'
  tertiary-fixed-dim: '#cbc6bb'
  on-tertiary-fixed: '#1d1c14'
  on-tertiary-fixed-variant: '#49473e'
  background: '#fff8f6'
  on-background: '#2e1508'
  surface-variant: '#ffdbcb'
typography:
  display-hero:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  queue-token-lg:
    fontFamily: DM Sans
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: DM Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2.5rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system establishes a refined, welcoming, and high-trust dining experience for institutional culinary environments (universities, corporate offices, medical complexes, and residential hostels). Moving decisively away from clinical cafeteria terminals and garish fast-food delivery aesthetics, the design embraces an artisanal bistro sensibility balanced with effortless utilitarian flow.

### Design Movement: Modern Warm Editorial & Tactile Clean
The system combines the grace of modern editorial gastronomy with the structured clarity of functional scheduling software. 

- **Appetizing & Natural:** Warm bone-white surfaces and soft culinary cream establish an unhurried, nourishing environment that celebrates real ingredients.
- **Sophisticated & Trustworthy:** Editorial serif headings deliver authority and culinary pride, paired with hyper-legible geometric sans typography for high-frequency operational scanning (order numbers, prep statuses, allergens).
- **Calm Operational Precision:** Smooth micro-interactions, pill-shaped markers, soft warm-tinted shadows, and generous structural whitespace remove the frenzy typically associated with lunch rushes and collection bottlenecks.

## Colors

The palette balances culinary warmth with botanical freshness. Warm brown grounds typography with softer contrast than harsh pure black, while vibrant citrus orange and garden herb green anchor actions and life-cycle events.

### Primary & Action Colors
- **Primary Orange (`#F26B21`):** Represents appetite, momentum, and primary action. Used for main transactional buttons, active navigation state indicators, and active preparation cues.
- **Orange Hover (`#D95716`):** Deepened burnt tone for hover, active depression, and high-contrast interactions.
- **Natural Green (`#3F6B3A`):** Secondary brand anchor evoking freshness, organic provenance, dietary validation, and final order readiness.
- **Light Green Surface (`#E8F0E3`):** Botanical tint for soft container backgrounds, accepted states, and vegan/healthy category tags.

### Surfaces & Neutral Foundations
- **Canvas Background (`#FFFDF8`):** Off-white warm canvas mimicking fine linen cardstock.
- **Soft Cream Surface (`#F7F1E5`):** Secondary container surface providing layered physical separation without relying on heavy contrast borders.
- **Subtle Border (`#E8DED2`):** Delicate separation line tone, warm and tactile.
- **Rich Brown Display (`#4A2C1D`):** Primary display tone for titles, hero headers, and crucial token numbers.
- **Body Text (`#665B53`):** Accessible, warm earth tone for descriptive body copy, dietary notes, and timestamps.
- **Subtle Muted (`#9E9188`):** Inactive indicators, secondary metadata, and placeholder copy.

### Kitchen Life-Cycle & Queue Status Semantic Tokens
- **Placed:** Background `#F7F1E5` | Text `#4A2C1D` (Neutral pending acknowledgment)
- **Accepted:** Background `#E8F0E3` | Text `#3F6B3A` (Confirmed by line kitchen)
- **Preparing:** Background `#FDF0E6` | Text `#F26B21` (Actively simmering/firing)
- **Ready for Pickup:** Background `#3F6B3A` | Text `#FFFFFF` (High visibility collection beacon)
- **Collected / Completed:** Background `#EDF4EC` | Text `#2D4D29` (Harmonious archive state)
- **Delayed:** Background `#FBE9DE` | Text `#C0480D` (Urgent culinary alert)
- **Cancelled / Rejected:** Background `#FCEAE6` | Text `#8B322C` (Clear terminal state)

## Typography

The typographic hierarchy intentionally contrasts high-craft gastronomic charm with hyper-clear informational utility.

### Headline Family: Playfair Display
Used exclusively for moments of culinary delight, marquee section headers, meal titles, and welcome states. It brings warmth, maturity, and artisanal elegance to a daily institutional touchpoint, removing sterile cafeteria connotations.

### Body & Operational Family: DM Sans
Chosen for its human, geometric precision, open counters, and high legibility at glance speed. It drives all critical queue metadata, nutrition metrics, timers, and collection code readouts.
- Use `queue-token-lg` with tabular numbers enabled (`font-variant-numeric: tabular-nums`) to prevent optical wobble during token counter updates.
- Use `label-caps` for status micro-headers and dietary classification ribbons.

## Layout & Spacing

The layout philosophy centers on a relaxed, spacious grid that gives food photography and real-time statuses room to breathe. Crowded layouts cause cognitive friction; this system relies on generous internal card padding and clear vertical pacing.

### Layout Mechanics
- **Desktop Management & Terminal (1200px+):** Fluid 12-column layout with 24px gutters and 40px outer margins. The desktop management view uses a fixed-width left navigation rail (`280px`) with the main workspace adapting smoothly.
- **Tablet / Countertop Kiosk (768px - 1199px):** 8-column layout with 20px gutters. Optimized for split screens (Menu Catalog 60% / Live Queue Order Summary 40%).
- **Mobile Handheld (320px - 767px):** 4-column layout with 16px gutters and 20px edge margins. Interfaces collapse into a sticky top context header, single-column scrollable stream, and floating bottom tab bar.

## Elevation & Depth

Depth is tactile, warm, and natural. Surfaces do not float on sterile synthetic gray drop shadows; instead, they cast diffused shadows tinted with warm rich brown (`rgba(74, 44, 29, ...)`).

### Elevation Scale
- **Level 0 (Flat Canvas):** `#FFFDF8` background. Borders defined by 1px solid `#E8DED2`.
- **Level 1 (Card & Sub-Panel):** Pure surface white `#FFFFFF` or soft cream `#F7F1E5` with `box-shadow: 0 4px 16px rgba(74, 44, 29, 0.04)`. Used for food menu cards, stat containers, and quiet list items.
- **Level 2 (Interactive Floating & Highlighted Queue Cards):** `box-shadow: 0 8px 24px rgba(74, 44, 29, 0.06), 0 2px 6px rgba(74, 44, 29, 0.03)`. Used for active queue token cards, active pickup cards, and hover states.
- **Level 3 (Modals, Slide-overs & Sticky Bottom Trays):** `box-shadow: 0 16px 40px rgba(74, 44, 29, 0.12), 0 4px 12px rgba(74, 44, 29, 0.04)`.

## Shapes

The design system embraces an organic, welcoming geometry. 

- **Cards and Major Containers:** Built with custom generous corners of `20px` to `24px`. This softens the UI, evoking handcrafted artisanal serving boards and tactile menus.
- **Input Controls and Operational Steppers:** Scaled at `12px` to `16px` for comfortable finger targeting.
- **Pill System (Full Radius `9999px`):** Reserved exclusively for dynamic status markers, dietary badges (GF, Vegan, Halal), filter category chips, and floating order count notifications.

## Components

### Buttons
- **Primary CTA:** Background `#F26B21`, text `#FFFFFF`, border none, border-radius `9999px` (or `14px` inside dense forms), font `label-lg`. Hover: `#D95716`. Active: transform scale `0.98`.
- **Secondary Botanical Outlined:** Background `transparent`, border `1.5px solid #3F6B3A`, text `#3F6B3A`. Hover: background `#E8F0E3`.
- **Ghost Warm:** Background `transparent`, text `#4A2C1D`. Hover: background `#F7F1E5`.

### Chips & Category Filters
- **Filter Pills:** Height `40px`, padding `0 20px`, radius `9999px`, font `label-md`. 
  - *Inactive:* Surface `#FFFFFF`, border `1px solid #E8DED2`, text `#665B53`.
  - *Active:* Surface `#4A2C1D`, border `1px solid #4A2C1D`, text `#FFFFFF`.

### Food Card
- **Structure:** Solid `#FFFFFF` container, border `1px solid #E8DED2`, radius `20px`, overflow hidden.
- **Visuals:** 16:10 aspect ratio food photography with embedded floating botanical dietary badges on the top-left (e.g., "Organic", "Plant-based").
- **Content:** Title in `headline-sm` (`#4A2C1D`), short ingredient narrative in `body-sm` (`#665B53`), price formatted in `DM Sans 700` (`#F26B21`). Bottom right features a quick-add `+` pill trigger.

### Quantity Stepper (+/-)
- **Container:** Rounded pill (`9999px`) in `#F7F1E5` background, height `36px`, padding `2px 8px`.
- **Buttons:** Circular `#FFFFFF` touch targets with subtle warm shadow. Text `#4A2C1D`.
- **Counter:** Fixed width `24px` centered text in `DM Sans 700`.

### Queue Token Card
- **Hero State:** Background `#FFFFFF`, radius `24px`, 1px solid `#E8DED2`, shadow Level 2.
- **Header:** "ESTIMATED PICKUP" in `label-caps` (`#9E9188`) alongside an animated pulse icon.
- **Pickup Time:** `headline-md` displaying specific target slot (e.g., "12:45 PM").
- **Token Centerpiece:** Soft Cream `#F7F1E5` inner container with large token display (e.g., `#B-142`) in `queue-token-lg` (`#4A2C1D`).
- **Footer:** Dynamic Status Chip stretching full-width.

### Order Status Stepper
- Horizontal bar on desktop, vertical compact spine on mobile.
- Connected by 2px track: `#E8DED2` for unfinished stages, `#3F6B3A` for completed steps.
- Indicators: 28px circles with checkmarks or active pulsing rings in `#F26B21`.

### Data Table (Canteen Management View)
- Header row: uppercase `label-caps` (`#665B53`) over `#F7F1E5` fill with bottom border `1px solid #E8DED2`.
- Cells: `body-sm`, vertical padding `16px`. Hover row fill: `#FFFDF8`.

### Navigation
- **Mobile Bottom Tab Bar:** Fixed bottom container, height `68px`, surface `#FFFFFF` with top border `1px solid #E8DED2`. Active state indicated by primary orange icons with subtle dot indicator underneath.
- **Desktop Sidebar:** Fixed `280px`, surface `#FFFDF8`, right border `1px solid #E8DED2`. Brand logo at top in `Playfair Display`, navigation links with `12px` rounded active highlights in `#F7F1E5` and text `#F26B21`.