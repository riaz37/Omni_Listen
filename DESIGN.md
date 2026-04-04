# Design System — ESAPAIListen

## Product Context
- **What this is:** AI meeting assistant that records, transcribes, and extracts actionable insights
- **Who it's for:** Professionals and teams who want to stop taking notes in meetings
- **Space/industry:** AI meeting intelligence (Otter, Fireflies, Granola, Read.ai)
- **Project type:** Web app + marketing landing page

## Aesthetic Direction
- **Direction:** Industrial-Clean. Function-first with personality. Sharp, confident, technical.
- **Decoration level:** Intentional. Subtle grain texture on hero/marketing backgrounds, not decorative blobs.
- **Mood:** Like a premium terminal meets Linear. Not warm-editorial like Granola, not corporate like Otter. The neon green is the personality.
- **Reference sites:** granola.ai (editorial contrast), linear.app (technical precision), vercel.com (developer-facing polish)

## Typography
- **Display/Hero:** Instrument Serif — elegant contrast to the technical UI. Serifs ONLY for hero headings and marketing pages, never in the app UI.
- **Body/UI:** Geist Sans — clean, modern, excellent readability at small sizes. Replaces Inter. Tabular-nums support for data.
- **Data/Tables:** Geist Sans with `font-variant-numeric: tabular-nums` — numbers align in columns.
- **Code/Mono:** Geist Mono — pairs perfectly with Geist Sans, used for timestamps, durations, metadata.
- **Loading:** Google Fonts: `Instrument+Serif:ital@0;1` + `Geist:wght@300;400;500;600;700` + `Geist+Mono:wght@400;500;600`
- **Scale:**
  - Display Large: 56-72px (clamp), Instrument Serif 400, line-height 1.08, tracking -0.02em
  - Display Medium: 36px, Instrument Serif 400, line-height 1.2, tracking -0.01em
  - Heading: 24px, Geist 600, line-height 1.3
  - Subheading: 18px, Geist 600, line-height 1.4
  - Body: 16px, Geist 400, line-height 1.7
  - UI/Label: 14px, Geist 500, line-height 1.5
  - Small/Caption: 12px, Geist 500, line-height 1.5
  - Mono: 14px, Geist Mono 400

## Color
- **Approach:** Restrained. Neon green is the ONLY accent. Everything else is neutral.
- **Primary:** `#22c55e` / `hsl(150 85% 47%)` — the brand. Used for CTAs, active states, badges, links.
- **Primary Hover:** `#16a34a` / `hsl(150 85% 38%)` — darkened for hover.
- **Primary Foreground:** `#0a0a0a` — dark text on green buttons (both modes).
- **Neutrals (light mode):**
  - Background: `#ffffff` / `hsl(0 0% 100%)`
  - Background-2: `#fafafa` / `hsl(0 0% 98%)`
  - Surface: `#f1f5f9` / `hsl(210 40% 96%)`
  - Border: `#e2e8f0` / `hsl(214 32% 91%)`
  - Foreground: `#0a0a0a` / `hsl(0 0% 4%)`
  - Muted: `#64748b` / `hsl(215 16% 47%)`
- **Neutrals (dark mode):**
  - Background: `#0a0a0a` / `hsl(0 0% 4%)`
  - Background-2: `#141414` / `hsl(0 0% 8%)`
  - Surface: `#1e1e1e` / `hsl(0 0% 12%)`
  - Border: `#27272a` / `hsl(240 4% 16%)`
  - Foreground: `#fafafa` / `hsl(0 0% 98%)`
  - Muted: `#94a3b8` / `hsl(215 16% 65%)`
- **Semantic:**
  - Success: `#22c55e` (same as primary)
  - Warning: `#f59e0b`
  - Error: `#ef4444`
  - Info: `#3b82f6`
- **Dark mode strategy:** True dark (#0a0a0a), not dark gray. Cool slate neutrals. Primary green stays the same hue, slightly increased lightness for contrast.

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable (not cramped like Linear, not spacious like Notion)
- **Scale:** 2px, 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- **Section padding:** 80px vertical (desktop), 48px (mobile)
- **Card padding:** 20-24px
- **Component gaps:** 8-12px (tight), 16-24px (comfortable), 32-48px (spacious)

## Layout
- **Approach:** Grid-disciplined for app, creative for landing page hero
- **Grid:** 12-column on desktop (1024+), 8-column tablet (768-1023), single column mobile
- **Max content width:** 1100px (7xl container)
- **Border radius:**
  - sm: 4px (small inputs, tags)
  - md: 8px (buttons, cards, inputs)
  - lg: 12px (modals, larger cards, sections)
  - full: 9999px (pills, avatars, badges)
- **Elevation (box-shadow):**
  - sm: `0 1px 2px rgba(0,0,0,0.05)` (subtle lift)
  - md: `0 4px 12px rgba(0,0,0,0.08)` (cards, dropdowns)
  - lg: `0 8px 24px rgba(0,0,0,0.12)` (modals, popovers)
  - In dark mode: reduce shadow opacity by 50%, add subtle border instead

## Motion
- **Approach:** Intentional (see animation plan for full specs)
- **Easing:**
  - Enter: ease-out `[0, 0, 0.2, 1]`
  - Exit: ease-in `[0.4, 0, 1, 1]`
  - Move: ease-in-out `[0.4, 0, 0.2, 1]`
  - Interactive: spring `{ stiffness: 300, damping: 24, mass: 0.8 }`
- **Duration:**
  - Instant: 100ms (toggles, active states)
  - Fast: 200ms (hover, color transitions)
  - Normal: 300ms (modals, dropdowns)
  - Slow: 500ms (page transitions, reveals)
  - Dramatic: 700ms (hero entrances, landing only)
- **Reduced motion:** All animation disabled when `prefers-reduced-motion: reduce`

## Anti-Patterns (never do these)
- Purple/violet gradients or blue-to-purple schemes
- 3-column feature grid with icons in colored circles
- Centered everything with uniform spacing
- Uniform bubbly border-radius on all elements
- Inter, Roboto, Arial, or system fonts as primary
- Decorative blobs, floating circles, wavy SVG dividers
- "Welcome to X" / "Unlock the power of" hero copy
- Cookie-cutter section rhythm (hero → features → testimonials → pricing → CTA)

## Texture
- **Grain:** Subtle SVG noise filter on hero/marketing backgrounds. Opacity 0.03 light, 0.04 dark.
- **Pattern for empty states:** Dot-grid background (distinguishes empty from loading)

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-04 | Initial design system created | Created by /design-consultation based on competitive research (Granola, Otter, Fireflies) |
| 2026-04-04 | Instrument Serif for display | Nobody in the meeting AI space uses serifs. Premium, unexpected, memorable. |
| 2026-04-04 | Geist Sans replaces Inter | Inter is the most overused font in web apps. Geist is cleaner and less generic. |
| 2026-04-04 | Restrained color (green only accent) | Competitors use blue/purple. Neon green is our differentiator. Keep it the only accent. |
| 2026-04-04 | Cool slate neutrals | Industrial-clean aesthetic. Warm grays would clash with neon green. |
| 2026-04-04 | Grain texture on marketing backgrounds | Adds tactile quality without decorative bloat. Intentional, not decorative. |
