---
name: AeroMetric Intelligence
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#00668a'
  on-secondary: '#ffffff'
  secondary-container: '#40c2fd'
  on-secondary-container: '#004d6a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b1c30'
  on-tertiary-container: '#75859d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 16px
  widget-padding: 20px
  section-gap: 32px
---

## Brand & Style
The design system is engineered for high-stakes aviation decision-making. It balances a **Corporate/Modern** aesthetic with **Minimalist** precision to ensure that complex operational data remains legible and actionable. The brand personality is authoritative, reliable, and technologically advanced, mirroring the rigorous standards of international flight operations.

The visual language focuses on clarity and trust. It avoids decorative clutter in favor of functional density, utilizing structured grids and high-quality typography to evoke a premium Business Intelligence (BI) environment. The emotional response should be one of calm control and absolute clarity amidst the logistical complexity of Monastir International Airport.

## Colors
The palette is rooted in a **Deep Midnight Blue** (Primary), symbolizing the stability and depth of the aviation industry. **Sky Blue** (Secondary) provides a technical accent for interactive elements, while **Slate Gray** (Tertiary) handles metadata and supportive UI scaffolding.

For operational status tracking, a high-visibility functional palette is used:
- **Emerald Green**: Indicates "On Time" performance and healthy system metrics.
- **Amber Orange**: Signals "Delayed" status or warnings requiring attention.
- **Crimson Red**: Reserved for "Cancelled" flights or critical system alerts.

The background uses a clean **Off-White (#F8FAFC)** to reduce eye strain during long monitoring shifts. Dark mode should swap the surface and primary colors, utilizing `#0F172A` as the main canvas with slightly desaturated status colors for accessibility.

## Typography
This design system utilizes **Inter** for all primary UI elements to ensure maximum legibility at various scales. To support the technical nature of flight numbers and time-stamps, **JetBrains Mono** is introduced for data-heavy table cells, providing a rhythmic, tabular layout that is easy to scan.

- **Headlines**: Use tight letter spacing and bold weights to establish clear hierarchy.
- **Body**: Standardized at 14px for density without sacrificing readability.
- **Labels**: Small-caps are used for table headers and category descriptors to differentiate them from interactive content.
- **Mobile Adjustments**: `display-lg` should scale down to 28px on mobile devices to prevent overflow in dashboard widgets.

## Layout & Spacing
The layout follows a **Fluid Grid** system designed for 1440p displays but responsive down to mobile. 
- **Desktop**: A 12-column grid with 16px gutters.
- **Sidebar**: A fixed 260px left-hand navigation allows for consistent access to core modules (Arrivals, Departures, Ground Handling, Analytics).
- **Dashboard Widgets**: Use a modular "masonry" or "bento" style where cards span 3, 4, 6, or 12 columns depending on data complexity.
- **Rhythm**: All spacing is derived from a 4px base unit to ensure mathematical harmony across the UI.

## Elevation & Depth
To maintain a professional BI look, this design system uses **Tonal Layers** combined with **Low-Contrast Outlines**. 
- **Surface Level**: The background is the lowest tier (#F8FAFC).
- **Card Level**: Primary content containers use a white background with a 1px border (#E2E8F0) and a very soft, diffused shadow (0px 4px 12px rgba(15, 23, 42, 0.03)).
- **Interactive Level**: Hover states on cards or buttons should slightly increase the shadow spread and add a subtle 2px Sky Blue left-border accent.
- **Overlays**: Modals and dropdowns use a higher elevation with a more pronounced shadow to create clear separation from the dashboard underlay.

## Shapes
The shape language is **Soft (0.25rem)**, reflecting a professional and structured environment. 
- **Standard UI (Buttons, Inputs)**: 4px radius (0.25rem).
- **Cards/Containers**: 8px radius (0.5rem) to provide a modern, approachable feel to data blocks.
- **Status Pills**: 100px (full pill) to differentiate them from interactive buttons.
Large-scale structural elements like the sidebar remain sharp on the inner edges to maintain a sense of architectural stability.

## Components
- **Buttons**: Primary buttons are Deep Midnight Blue with white text. Secondary buttons use a Slate Gray ghost style.
- **Data Tables**: High-density rows with a 1px bottom border. Header rows use `label-caps` typography with a subtle gray background. Flight numbers must use `data-mono`.
- **Status Chips**: Small, high-contrast pills. For example, a "Delayed" chip features a light amber background with deep amber text.
- **Charts**: Use minimalist line and bar charts. Avoid gradients; use solid fills with the primary and secondary palette. Interactive tooltips should follow the "Card Level" elevation.
- **Sidebar**: A dark-themed sidebar (Deep Midnight Blue) provides a strong anchor for the light-themed dashboard content. Navigation items should use Sky Blue for active states.
- **KPI Cards**: Featured metrics (e.g., "Daily Passenger Flow") should display a large `display-lg` value with a trend indicator (arrow icon + percentage) in the corner.