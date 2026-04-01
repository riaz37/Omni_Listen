# Frontend Redesign Roadmap

Generated from /plan-design-review (8/10) + /plan-eng-review (CLEARED)
Branch: riaz | Base: main | Date: 2026-03-30

---

## Executive Summary

Full frontend redesign driven by Figma design tokens. No backend changes. 36+ files touched.
Goal: Every pixel driven by the Figma token system, zero hardcoded colors, proper dark mode everywhere.

---

## Phase 1: Foundation (Lanes A + B + C — parallel)

### Lane A: Token Migration
**Priority: P0 — everything depends on this**

| Step | File(s) | What | Est. |
|------|---------|------|------|
| A1 | `globals.css` | Convert all Figma hex tokens to HSL. Add 15 missing variables (hover states, neon-green, text-primary, card-border, background-2, destructive variants). Fix wrong primary green value. Both `:root` and `.dark` blocks. | 15 min |
| A2 | `tailwind.config.js` | Expose new CSS variables: `primary-hover`, `secondary-hover`, `destructive-hover`, `neon-green`, `text-primary`, `card-border`, `background-2`, `success`, `success-hover`. | 5 min |
| A3 | All 14 files with `dark:bg-[#...]` | Replace 67 hardcoded `dark:bg-[#09090B]` → `bg-background`, `dark:bg-[#18181B]` → `bg-card`, `dark:bg-[#27272A]` → `bg-muted`. | 10 min |
| A4 | All 10 files with `dark:border-[#...]` | Replace 21 hardcoded `dark:border-[#27272A]` → `border-border`. | 5 min |
| A5 | All 36 files with hardcoded green | Replace 217 occurrences: `bg-emerald-600` / `bg-green-600` → `bg-primary`, `text-emerald-600` / `text-green-600` → `text-primary` (for fills) or new `text-text-primary` (for text on light bg, accessibility). | 15 min |
| A6 | `app/layout.tsx` | Update `themeColor` meta from `#10b981` to Figma primary `#11DF78`. | 1 min |

**Figma Token → CSS Variable Mapping (complete reference):**

```
LIGHT MODE (:root)
═══════════════════════════════════════════════
Token Name              Figma Hex    HSL Value
───────────────────────────────────────────────
--background            #FFFFFF      0 0% 100%
--background-2          #F5F5F5      0 0% 96.1%          [NEW]
--foreground            #09090B      240 10% 3.9%
--card                  #FFFFFF      0 0% 100%
--card-foreground       #09090B      240 10% 3.9%
--card-2                #FFFFFF      0 0% 100%            [NEW]
--card-border           #E5E5E5      0 0% 89.8%          [NEW]
--popover               #FFFFFF      0 0% 100%
--popover-foreground    #09090B      240 10% 3.9%
--primary               #11DF78      150 85% 47.1%       [CHANGED]
--primary-foreground    #FAFAFA      0 0% 98%
--primary-hover         #27272A      240 3.7% 15.9%      [NEW]
--secondary             #F4F4F5      240 4.8% 95.9%
--secondary-foreground  #18181B      240 5.9% 10%
--secondary-hover       #E4E4E7      240 5.9% 90%        [NEW]
--accent                #F4F4F5      240 4.8% 95.9%
--accent-foreground     #18181B      240 5.9% 10%
--destructive           #DC2626      0 84.2% 50.2%
--destructive-foreground #FAFAFA     0 0% 98%
--destructive-hover     #EF4444      0 84.2% 60.2%       [NEW]
--destructive-bg-10     (10% opacity destructive)         [NEW]
--border                #E4E4E7      240 5.9% 90%
--input                 #E4E4E7      240 5.9% 90%
--ring                  #71717A      240 3.8% 46.1%
--muted                 #F4F4F5      240 4.8% 95.9%
--muted-foreground      #71717A      240 5% 64.9%
--success               #16A34A      142.1 76.2% 36.3%
--success-hover         #15803D      142.4 71.8% 29.2%   [NEW]
--neon-green            #ADFA1D      76 96% 54.5%        [NEW]
--text-primary          #086737      153 86.4% 21.8%     [NEW]
--sidebar-background    #FAFAFA      0 0% 98%
--sidebar-foreground    #3F3F46      240 5.3% 26.1%
--sidebar-primary       #18181B      240 5.9% 10%        [NEW]
--sidebar-primary-fg    #FAFAFA      0 0% 98%            [NEW]
--sidebar-accent        #F4F4F5      240 4.8% 95.9%
--sidebar-accent-fg     #18181B      240 5.9% 10%
--sidebar-border        #E4E4E7      240 5.9% 90%
--sidebar-ring          #A1A1AA      240 4.9% 65.1%      [NEW]

DARK MODE (.dark)
═══════════════════════════════════════════════
--background            #09090B      240 10% 3.9%
--background-2          #262626      0 0% 14.9%          [NEW]
--foreground            #FAFAFA      0 0% 98%
--card                  #09090B      240 10% 3.9%
--card-foreground       #FAFAFA      0 0% 98%
--card-2                #18181B      240 5.9% 10%        [NEW]
--card-border           #27272A      240 3.7% 15.9%      [NEW]
--popover               #09090B      240 10% 3.9%
--popover-foreground    #FAFAFA      0 0% 98%
--primary               #13F584      150 91.9% 51.8%     [CHANGED]
--primary-foreground    #18181B      240 5.9% 10%
--primary-hover         #F4F4F5      240 4.8% 95.9%      [NEW]
--secondary             #27272A      240 3.7% 15.9%
--secondary-foreground  #FAFAFA      0 0% 98%
--secondary-hover       #3F3F46      240 5.3% 26.1%      [NEW]
--accent                #27272A      240 3.7% 15.9%
--accent-foreground     #FAFAFA      0 0% 98%
--destructive           #EF4444      0 84.2% 60.2%
--destructive-foreground #FAFAFA     0 0% 98%
--destructive-hover     #DC2626      0 84.2% 50.2%       [NEW]
--destructive-bg-10     (10% opacity destructive)         [NEW]
--border                #3F3F46      240 5.3% 26.1%
--input                 #3F3F46      240 5.3% 26.1%
--ring                  #A1A1AA      240 4.9% 65.1%
--muted                 #27272A      240 3.7% 15.9%
--muted-foreground      #A1A1AA      240 5% 64.9%
--success               #22C55E      142.1 70.6% 45.3%
--success-hover         #16A34A      142.1 76.2% 36.3%   [NEW]
--neon-green            #ADFA1D      76 96% 54.5%        [NEW]
--text-primary          #BBF7D0      141 78.9% 85.1%     [NEW]
--sidebar-background    #18181B      240 5.9% 10%
--sidebar-foreground    #F4F4F5      240 4.8% 95.9%
--sidebar-primary       #1D4ED8      226 70.7% 48%       [NEW]
--sidebar-primary-fg    #FFFFFF      0 0% 100%           [NEW]
--sidebar-accent        #27272A      240 3.7% 15.9%
--sidebar-accent-fg     #F4F4F5      240 4.8% 95.9%
--sidebar-border        #27272A      240 3.7% 15.9%
--sidebar-ring          #D4D4D8      240 4.9% 83.9%      [NEW]
```

### Lane B: Route Group Setup
**Priority: P0 — landing page redesign depends on this**

| Step | What | Est. |
|------|------|------|
| B1 | Create `app/(marketing)/` route group. Move: page.tsx, about/, pricing/, careers/, contact/, security/, privacy/, terms/ | 10 min |
| B2 | Create `app/(marketing)/layout.tsx` with marketing nav + footer (extracted from current page.tsx) | 10 min |
| B3 | Create `app/(app)/` route group. Move: dashboard/, history/, events/, tasks/, notes/, queries/, analytics/, settings/, calendar/, meeting/ | 10 min |
| B4 | Create `app/(app)/layout.tsx` with Navigation component + main content area | 5 min |
| B5 | Slim down root `app/layout.tsx` to providers only (remove any layout concerns) | 5 min |
| B6 | Verify all routes still work: `/`, `/about`, `/dashboard`, `/history`, etc. | 5 min |

### Lane C: Console.log Cleanup
**Priority: P1 — independent, can run anytime**

| Step | What | Est. |
|------|------|------|
| C1 | Remove all 128 `console.log` / `console.error` / `console.warn` calls across 26 files | 10 min |
| C2 | Replace user-facing error scenarios with Toast notifications | 10 min |
| C3 | Keep only essential error logging in auth-context.tsx and global-state-context.tsx (use proper logger if available) | 5 min |

---

## Phase 2: Component Redesign (Lanes D + E — after Phase 1 merges)

### Lane D: Dashboard Split + Workspace Layout
**Priority: P0 — core UX improvement**

| Step | What | Est. |
|------|------|------|
| D1 | Extract from dashboard/page.tsx: `DashboardRecorder.tsx` (~300 lines) — recording controls, timer, audio visualization, file upload | 15 min |
| D2 | Extract: `DashboardAnalytics.tsx` (~200 lines) — stat cards, quick stats display | 10 min |
| D3 | Extract: `DashboardRecentMeetings.tsx` (~200 lines) — recent meetings list, meeting cards | 10 min |
| D4 | Extract: `DashboardProcessing.tsx` (~150 lines) — processing status, progress bar | 10 min |
| D5 | Rewrite dashboard/page.tsx as thin workspace orchestrator (~150 lines) composing all sub-components | 15 min |
| D6 | Implement workspace layout: primary recording area (center), quick stats (top), recent meetings (below), morning briefing (sidebar on desktop, bottom on mobile) | 20 min |

### Lane E: Navigation Redesign
**Priority: P0 — core UX improvement**

| Step | What | Est. |
|------|------|------|
| E1 | Redesign Navigation.tsx with 3-tier hierarchy: PRIMARY (Dashboard, History, Calendar) always visible in top bar | 15 min |
| E2 | Add SECONDARY "Workspace" dropdown (Events, Tasks, Notes, Analysis) | 10 min |
| E3 | Add TERTIARY items in user avatar menu (Analytics, Settings, Theme toggle, Logout) | 10 min |
| E4 | Mobile: bottom tab bar for PRIMARY items (3 tabs), sheet/drawer for SECONDARY | 15 min |
| E5 | Add keyboard navigation: Tab through items, Enter to activate, Escape to close dropdowns | 10 min |
| E6 | Add skip-to-content link for accessibility | 2 min |

---

## Phase 3: States + Onboarding (Lane F — after Phase 2)

### Lane F: Interaction States + Empty States + Onboarding
**Priority: P1 — UX polish**

| Step | What | Est. |
|------|------|------|
| F1 | Extend EmptyState.tsx to accept `variant` prop. Create per-feature configs: dashboard, history, events, tasks, notes, analytics, queries, calendar | 15 min |
| F2 | Apply EmptyState variants to all 9 feature pages with contextual copy and CTAs per the state table from design review | 20 min |
| F3 | Add Skeleton loading states to all feature pages (use existing Skeleton.tsx) | 15 min |
| F4 | Add error states to all feature pages (retry button + Toast notification) | 15 min |
| F5 | Create `WelcomeCard.tsx` — onboarding card for empty dashboard with 3 steps: Connect Calendar, Record First Meeting, Explore Insights | 15 min |
| F6 | Add conditional rendering: show WelcomeCard when user has zero meetings, hide after first recording completes | 10 min |
| F7 | Use neon-green (#ADFA1D) for live recording indicator in FloatingStatusIndicator.tsx and dashboard recorder | 5 min |

---

## Phase 4: Landing Page (Lane G — after Phase 1)

### Lane G: Landing Page Redesign
**Priority: P1 — marketing presence**

| Step | What | Est. |
|------|------|------|
| G1 | Convert all hardcoded colors in page.tsx to CSS variables (bg-white → bg-background, text-gray-900 → text-foreground, etc.) | 15 min |
| G2 | Dark mode support: all sections use CSS vars, theme toggle works | 10 min |
| G3 | Kill the icon-in-circle bento grid. Replace features section with product screenshots or inline demo showing real meeting data | 20 min |
| G4 | Update hero copy: tighten "AI-powered intelligence layer" → more product-specific language | 5 min |
| G5 | Add visual anchor: product screenshot or app preview in hero section | 10 min |
| G6 | Accessibility: use text-primary (#086737 light / #BBF7D0 dark) for all green text. Keep --primary for button fills. | 10 min |

---

## Phase 5: Testing (Lane H — after all code changes)

### Lane H: Test Infrastructure + Tests
**Priority: P0 — safety net**

| Step | What | Est. |
|------|------|------|
| H1 | Install Vitest + @testing-library/react + jsdom. Create vitest.config.ts | 5 min |
| H2 | Install Playwright. Create playwright.config.ts | 5 min |
| H3 | Static analysis test: grep for hardcoded hex values in .tsx files. Must return 0 matches. | 5 min |
| H4 | Unit test: ThemeProvider toggles, persists, respects system preference | 10 min |
| H5 | Unit test: Navigation renders 3-tier hierarchy correctly | 10 min |
| H6 | Unit test: EmptyState renders correct variant per feature | 5 min |
| H7 | Unit test: All Figma tokens present in globals.css (automated token check) | 5 min |
| H8 | E2E test: Landing page renders in light + dark mode | 10 min |
| H9 | E2E test: Dashboard recording flow works end-to-end | 15 min |
| H10 | E2E test: Navigation works on mobile viewport (375px) | 10 min |
| H11 | E2E test: Theme toggle persists across page reload | 5 min |

---

## Phase 6: Documentation

| Step | What | Est. |
|------|------|------|
| I1 | Create DESIGN.md with full token system documentation | 15 min |
| I2 | Create TODOS.md with deferred items: ESLint hex rule, full test coverage, keyboard shortcuts, Figma→CSS pipeline | 5 min |

---

## Execution Timeline

```
PARALLEL EXECUTION MAP
═══════════════════════════════════════════════════════════════

Phase 1 (parallel):                              ✅ COMPLETED 2026-03-30
  Lane A ████████████✓ Token migration
  Lane B ████████████✓ Route groups
  Lane C ████████████✓ Console.log cleanup

Phase 2 (parallel after Phase 1):                ✅ COMPLETED 2026-03-30
  Lane D ████████████✓ Dashboard split
  Lane E ████████████✓ Navigation redesign

Phase 3 (after Phase 2):                         ✅ COMPLETED 2026-03-30
  Lane F ████████████✓ States + onboarding

Phase 4 (parallel with Phase 2 or 3):            ✅ COMPLETED 2026-03-30
  Lane G ████████████✓ Landing page

Phase 5 (after all code):                        ⬚ PENDING
  Lane H █████████████ Testing                 (~85 min)
                       ─── merge ───

Phase 6 (anytime):                               ⬚ PENDING
  Docs   ███░░░░░░░░░░ DESIGN.md + TODOS.md   (~20 min)
```

---

## Design Decisions Reference (from /plan-design-review)

| # | Decision | Resolution |
|---|----------|-----------|
| 1 | Navigation structure | 3-tier: PRIMARY (Dashboard, History, Calendar), SECONDARY (Events, Tasks, Notes, Analysis), TERTIARY (Analytics, Settings) |
| 2 | Token format | Figma hex → HSL, keep hsl(var(--x)) pattern for shadcn/ui compat |
| 3 | Landing dark mode | Full dark mode via CSS variable system |
| 4 | Sidebar vs top-nav | Keep top-nav. Sidebar tokens mapped but reserved. |
| 5 | Neon-green usage | Live recording indicator + 'new' badges |
| 6 | Accessibility contrast | text.Primary (#086737/#BBF7D0) for green text, --primary for fills |
| 7 | AI slop fix | Kill icon-in-circle bento grid. Product screenshots + workspace layout. |
| 8 | Card variants | card, card-2, card-border tokens mapped. card-2 for elevated surfaces. |

## Eng Decisions Reference (from /plan-eng-review)

| # | Decision | Resolution |
|---|----------|-----------|
| 1 | Dashboard split | Extract 4-5 sub-components before redesigning |
| 2 | Route groups | Create (marketing) and (app) route groups |
| 3 | Zero hardcoded hex | All colors through CSS variables, no exceptions |
| 4 | Green DRY | Replace 217 hardcoded green occurrences with token references |
| 5 | Console.log cleanup | Remove 128 debug logs, use Toast for user-facing errors |
| 6 | Test infrastructure | Vitest + Playwright + static analysis guard |

## Critical Failure Modes to Watch

| # | Risk | Mitigation |
|---|------|-----------|
| 1 | Missing CSS variable → invisible UI | Automated token check test (H7) |
| 2 | Props lost during dashboard split | Unit tests for each sub-component (H5) |
| 3 | Route group breaks existing URLs | Manual verification step (B6) |
| 4 | Hardcoded colors creep back in | Static analysis guard test (H3) |

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 6 issues, 2 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR | score: 3/10 → 8/10, 8 decisions |

**VERDICT:** ENG + DESIGN CLEARED — ready to implement.
