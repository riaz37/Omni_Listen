# Dashboard Redesign Plan — 2026-04-18

Scope: `/listen` (the signed-in landing page). Dark + light mode. Text-only review (no mockups generated this round). First in a page-by-page redesign series — other pages handled in subsequent /plan-design-review sessions.

All decisions calibrate against `DESIGN.md` (Industrial-Clean, Instrument Serif display / Geist body, neon green `#12DE78` only accent, true-dark `#0a0a0a`).

---

## Problem statement

Current dashboard (`app/(app)/listen/page.tsx`) rates **5/10** on design completeness. Symptoms:

- Recorder and sidebar compete for attention; no clear hierarchy.
- Mic (the product's reason to exist) is buried inside a tabbed card with a collapsible below it.
- Header is happy-talk ("always listening, always organized") + a generic "Dashboard" title.
- Empty states are read-only tombstones ("No upcoming events. Events will appear here after syncing.") — no CTA, no warmth, no onboarding.
- Sidebar uses tabs → hides 2/3 of context at any moment.
- Recording visualizer is a fake sine-wave not driven by real audio.
- Processing takes over the whole 2/3 pane.
- Mobile bottom nav has 8 tabs in 375px — touch targets fail 44px.
- Card style is inconsistent (`bg-card` vs `bg-card-2`) with no formal variant spec.

---

## Design decisions (12 resolved)

| # | Decision | Principle |
|---|----------|-----------|
| 1 | **Action-first IA.** Mic is hero; context (events/tasks/recent) is a strip below. | One job per section. |
| 2 | **Teaching empty states** per panel: warm copy + primary CTA + dot-grid texture. | Empty states are features. |
| 3 | **Personal + contextual header.** "Good morning, {Name} · {date}" + active role chip + one-line briefing when present. | Time-horizon design. |
| 4 | **Real audio-driven waveform** (Web Audio API `AnalyserNode` on the MediaStream). Kill decorative sine-wave. | No fake affordances. |
| 5 | **Three card variants:** `default` (bg-card + border), `quiet` (bg-background-2, no border), `elevated` (bg-card + border + shadow, dark = 50% shadow). | Form carries hierarchy. |
| 6 | **Mobile nav: 5 primary + More.** Primary: Listen, History, Calendar, Tasks, More. Move Analytics / Notes / Events / Queries into More sheet. | Prioritize ruthlessly on mobile. |
| 7 | **Active recording collapses context** to a thin summary line ("3 events · 5 tasks · last recording 2h ago"). | One job. |
| 8 | **Progressive-disclosure analysis input.** Chip row (3 preset prompts) + "Custom prompt" link → textarea. Kill the 3-card AI-slop grid. | Subtraction. |
| 9 | **Upload as subtle link** below mic ("Or drop a recording file"). Page-level drag-drop. Kill the segmented tabs. | Subtraction. |
| 10 | **Inline processing card** replaces the mic (not the whole pane). Navigation-safe: processing continues in background, nav logo shows status. | Emotional arc. |
| 11 | **Briefing merges into greeting row.** No floating bubble. Expands on click. | One job per section. |
| 12 | **Three side-by-side context sections** (Upcoming / Pending / Recent), each showing top 3 + count. Mobile: stacked. | Scannability beats tabs. |

---

## Information architecture

### Desktop (1024+)

```
┌───────────────────────────────────────────────────────────────────────┐
│ Nav (sticky)                                                          │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Good morning, Riaz · Thu, Apr 18       [Executive ▾]   [theme]       │
│  3 items from yesterday are ready to review →                         │
│                                                                       │
│                       ┌─────────────────┐                             │
│                       │                 │                             │
│                       │    🎙️  MIC       │    (80-120px, centered)    │
│                       │   (idle/rec)    │                             │
│                       └─────────────────┘                             │
│                         0:00  ─ ─ ─ ─ ─                               │
│                                                                       │
│       [Budget concerns] [Action items] [Technical decisions]          │
│                   Custom prompt →                                     │
│                                                                       │
│              Or drop a recording file to upload                       │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│  UPCOMING (3)        │  PENDING TASKS (5)   │  RECENT (3)             │
│  ─────────────       │  ─────────────       │  ─────────────          │
│  • Item 1            │  ☐ Task 1 · urgent   │  · Q1 review   2h ago   │
│  • Item 2            │  ☐ Task 2            │  · 1:1 w/ Sam  1d ago   │
│  • Item 3            │  ☐ Task 3            │  · All-hands   2d ago   │
│  View all →          │  View all →          │  View all →             │
└───────────────────────────────────────────────────────────────────────┘
```

### Tablet (768–1023)

Same vertical order; context strip becomes 1 or 2 columns depending on width (prefer 2 × 2 stack over 3 cramped columns).

### Mobile (<768)

```
┌──────────────────────┐
│ Nav (sticky top)     │
├──────────────────────┤
│ Greeting + role      │
│ (briefing link)      │
│                      │
│        🎙️            │
│       0:00           │
│    • • • • •         │
│                      │
│ [chip][chip][chip]   │
│   Custom prompt →    │
│   Drop a file        │
├──────────────────────┤
│ UPCOMING (3)         │
│ · Item               │
│ · Item               │
│ ─────                │
│ TASKS (5)            │
│ ☐ Task               │
│ ─────                │
│ RECENT (3)           │
│ · Conversation       │
├──────────────────────┤
│ Tab bar: 5 + More    │
└──────────────────────┘
```

### Active-recording desktop (collapsed context)

```
│  Greeting row (same)                                                  │
│                                                                       │
│                       ┌─────────────────┐                             │
│                       │    🎙️ LISTENING  │                             │
│                       │  ▁▃▅▇█▇▅▃▁ real │                             │
│                       └─────────────────┘                             │
│                        1:24   (tabular-nums)                          │
│                      [pause] [stop] [cancel]                          │
│                                                                       │
│  3 events today · 5 pending tasks · last recording 2h ago             │
```

---

## Interaction state coverage

Every panel must specify all five states. Loading ≠ empty.

| Feature | Loading | Empty | Error | Success | Partial |
|---|---|---|---|---|---|
| Greeting + briefing | Thin 200ms fade-in; "Loading…" dimmed | Greeting only, no briefing line | Greeting only (error swallowed, logged) | As spec | — |
| Mic (idle) | n/a | n/a | Mic-perm blocked → inline banner (not just toast) with "Open browser settings" link | State → recording | — |
| Mic (recording) | n/a | n/a | Stream dropped → "Recording paused automatically. Reconnect mic and resume." | n/a | Paused state ✓ |
| Processing | progress bar + ETA (est. from bytes) + "Keep working, we'll ping you" | n/a | Inline recovery card: "Processing failed. Try again / Download audio / Support." Preserves blob. | Redirect to `/conversation?id=…` + success toast | Retry from last completed step where possible |
| Upcoming | Skeleton: 3 rows matching card shape, shimmer 1.2s | Dot-grid panel + "No events yet. They appear after you process a conversation." + CTA button "Start your first recording" (scrolls to mic) | Inline: "Couldn't load events. [Retry]" | n/a | "Showing 3 of 12 — View all" |
| Pending | Skeleton | Dot-grid + "Tasks show up after you listen — they'll include urgency and assignee." + CTA | Inline retry | Checkbox toggle: 150ms primary-green checkmark | Partial list |
| Recent | Skeleton | Dot-grid + "Your conversations live here. Tap to replay or extract more." + CTA | Inline retry | n/a | Partial list |
| Role picker | n/a | System presets only | Modal shows "Couldn't load your custom presets. [Retry]" | Toast "Role set to {name}" | — |

---

## Emotional arc

5-second visceral: User sees greeting by name → mic, big, breathing. Knows: *this is my listener, ready.*

5-minute behavioral: Recording works honestly — real waveform responds to their voice. Processing stays visible. They can keep working. Context strip tells them what today holds.

5-year relational: Dashboard feels like it remembers them. Role is persistent. Briefing surfaces only when it's real ("3 items from yesterday" — kill-if-empty). Empty states teach, then get out of the way.

**Killed:** "Welcome to X" happy talk. Generic "Dashboard" title. Floating bubble. Fake visualizer. 3-column feature card grid.

---

## Dark + light mode

Tokens already exist in `app/globals.css`. Deltas needed:

- **Card dark background:** currently `0 0% 10%`. Keep — sits correctly between bg-2 (8%) and surface (12%). Document in DESIGN.md.
- **Shadow opacity:** dark mode cards must use `dark:shadow-none dark:border-border/60` per DESIGN.md elevation rule. Audit and fix every card use.
- **Primary on dark:** `150 91.9% 51.8%` — slightly brighter than light mode. ✓ keep.
- **Recording state tokens (new):** `--recording: 0 84% 60%` (red-500 light / red-400 dark), `--recording-paused: 38 92% 50%`. Add to globals.css and DESIGN.md.
- **Dot-grid empty pattern:** CSS background `radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px) 0 0 / 16px 16px`. Lighter in light mode, same hue in dark.
- **Focus rings:** unchanged — `ring-2 ring-primary`.

### Mode-parity audit checklist
- [ ] Every new/changed component renders in both modes, verified visually.
- [ ] Contrast ≥ 4.5:1 on body text in both modes.
- [ ] No color-only status (recording, task done, urgency) — always pair with text/icon.
- [ ] Shadows reduced or replaced with border in dark.
- [ ] Dot-grid + grain textures visible but subtle in both modes (3% light, 4% dark per DESIGN.md).

---

## Responsive & accessibility

### Breakpoints
- **Desktop ≥1024:** greeting row + centered mic + 3-column context
- **Tablet 768–1023:** greeting row + centered mic + 2-column or stacked 3-row context
- **Mobile <768:** greeting stacks, mic dominant, context sections stack vertically

### A11y requirements
- Touch targets: min 44×44px everywhere (currently fails for sidebar trash buttons and mobile bottom bar).
- `aria-hidden="true"` on all decorative Lucide icons.
- `role="status" aria-live="polite"` region announces recording state changes ("Recording started", "Paused", "Stopped, processing") — throttle to state transitions only, never the ticking timer.
- Keyboard shortcuts on dashboard: `Space` start/pause record, `Esc` cancel, `Enter` stop-and-process. Visible hint strip below mic ("Space to start · Esc to cancel").
- Skip-to-content link already exists in nav ✓ keep.
- Tablist semantics for mobile bottom bar already correct ✓ keep — just reduce items to 5.
- Recording state: red dot must pair with text "Listening" / "Paused" / "Stopped" — no color-only.
- Processing: `<progress>` element with `aria-label="Processing audio"` + live percentage announced every 25% change.
- Focus ring: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background` everywhere.

---

## Design system additions (update DESIGN.md)

1. **Card variants** — `default`, `quiet`, `elevated`. Spec with bg, border, shadow rules per mode.
2. **Recording tokens** — `--recording`, `--recording-paused` in `:root` and `.dark`.
3. **Empty state pattern** — `<EmptyState variant="dot-grid">` component. Props: icon, title, body, cta. Reusable across all panels.
4. **Density** — document when to use `bg-quiet` (sidebar/section wrappers) vs `bg-card` (primary content surfaces).
5. **Dark-mode shadow rule** — formalize: `shadow-md dark:shadow-none dark:border-border/60`.

---

## Component changes

### New / heavy rework
- `app/(app)/listen/page.tsx` — complete layout rebuild. Greeting row + mic + chips + upload link + 3-column context strip.
- `components/dashboard/GreetingHeader.tsx` (new) — greeting, date, role chip, inline briefing.
- `components/dashboard/RecorderHero.tsx` (new, replaces `DashboardRecorder.tsx`) — mic, real waveform, controls, chip row, custom prompt link, upload link.
- `components/dashboard/RealWaveform.tsx` (new) — Web Audio `AnalyserNode` driven bars.
- `components/dashboard/ContextStrip.tsx` (new, replaces `DashboardRecentConversations.tsx` tabs) — 3 side-by-side sections with overflow behavior.
- `components/dashboard/ProcessingCard.tsx` (new, replaces `DashboardProcessing.tsx`) — inline variant with ETA, retry, download-audio fallback.
- `components/EmptyState.tsx` — extend with `dot-grid` variant + `cta` prop.
- `components/Navigation.tsx` — reduce primary items to 5, move Analytics/Notes/Events/Queries into More sheet, enforce 44px touch targets.
- `components/MorningBriefingCard.tsx` — repurpose as expandable briefing content inside `GreetingHeader` (no longer floating).

### Delete
- `components/dashboard/DashboardRecorder.tsx` (replaced by RecorderHero)
- `components/dashboard/DashboardRecentConversations.tsx` (replaced by ContextStrip)
- `components/dashboard/DashboardProcessing.tsx` (replaced by ProcessingCard)
- Floating `MorningBriefingCard` invocation in `app/(app)/listen/page.tsx`

### Styling / tokens
- `app/globals.css` — add `--recording`, `--recording-paused`; document card-10% dark value; add dot-grid utility.
- `DESIGN.md` — add card variants, recording tokens, dot-grid pattern, dark shadow rule.
- `tailwind.config.js` — expose new tokens if needed.

### Electron mini-window sync (in-scope for this PR)
- When Electron mini-window holds the active recording, dashboard `RecorderHero` must reflect that state: mic disabled with label "Recording in mini window" + a "Bring main window forward" link.
- Single source of truth: `useGlobalState.isRecording` already ticks via IPC in `useElectronSync`. RecorderHero subscribes; no new IPC needed.
- Stop-from-dashboard while mini is recording: emit stop IPC, wait for ack, transition to processing inline.

---

## What already exists (reuse, don't reinvent)

- `components/Navigation.tsx` shell + `SegmentedThemeToggle` + `UserAvatarMenu`
- `components/ui/tabs.tsx`, `dropdown`, `button`, `checkbox`, `page-transition`, `page-entrance`
- `lib/motion.ts` — `DURATIONS`, `EASINGS`, `SPRINGS`
- `boneyard-js/react` `<Skeleton>` primitive
- `hooks/useDashboardData.ts`, `useElectronSync`, `useWebSocketNotifications`, `useGlobalState`
- Role/preset infrastructure (`presetsAPI`, `SYSTEM_PRESETS`, `RoleConfigModal`)
- Light + dark tokens in `globals.css`

---

## NOT in scope (explicitly deferred)

- Other pages (analytics, calendar, conversation, events, history, notes, queries, settings, tasks, marketing, auth) — each gets its own /plan-design-review session.
- Electron mini-window redesign — separate surface.
- Marketing/landing page — different rule set (LANDING), separate session.
- Design token restructuring beyond listed additions.
- Real-time collaboration features.
- A/B testing framework for dashboard variants.
- Mockup generation — user chose text-only this round.

---

## Risks

- **Real waveform cost:** AnalyserNode on the MediaStream is fine, but requestAnimationFrame at 60fps + render of 24 bars can be ~3–6% CPU on low-end devices. Mitigate with 30fps throttle + reduced bar count on mobile.
- **Processing stays inline:** means `startProcessing` + polling lives on dashboard. Ensure polling pauses/cleans up on unmount.
- **Nav item reduction:** moving Analytics/Notes into More sheet may surface analytics usage telemetry concerns. If analytics is a frequent destination, revisit (keep Analytics in primary, drop Calendar or something else).
- **Teaching empty states with CTAs** can feel pushy if all three panels shout "Start your first recording." Mitigate: only the first empty panel shows the full CTA; subsequent panels are quieter.

---

## Implementation phases (suggested for /plan-eng-review)

1. **Tokens + DESIGN.md** — add card variants, recording tokens, dot-grid pattern. (~1–2 files.)
2. **New primitives** — `<EmptyState dot-grid>`, card variants, keyboard shortcut hook.
3. **RealWaveform component** — isolated, testable.
4. **GreetingHeader + briefing merge.**
5. **RecorderHero** (replaces DashboardRecorder). Includes chip row, custom prompt disclosure, upload link.
6. **ContextStrip** (replaces sidebar). 3 side-by-side sections with mobile stack.
7. **ProcessingCard** (inline processing).
8. **Navigation mobile 5+More.**
9. **Accessibility pass** — `aria-live`, `aria-hidden`, keyboard shortcuts, touch targets.
10. **Dark mode audit** — shadow rule, contrast, parity.
11. **Delete dead components.**

---

## TODOS

To be proposed individually via AskUserQuestion after this plan file is written — see conversation flow.

---

## Completion summary

```
+====================================================================+
|         DASHBOARD DESIGN PLAN REVIEW — COMPLETION SUMMARY          |
+====================================================================+
| System Audit         | DESIGN.md strong, UI scope = dashboard only |
| Step 0               | Initial: 5/10 · Focus: all 7 passes         |
| Step 0.5 (mockups)   | Skipped — user chose text-only              |
| Pass 1 (Info Arch)   | 4/10 → 8/10                                 |
| Pass 2 (States)      | 3/10 → 9/10                                 |
| Pass 3 (Journey)     | 4/10 → 9/10                                 |
| Pass 4 (AI Slop)     | 6/10 → 9/10                                 |
| Pass 5 (Design Sys)  | 7/10 → 9/10                                 |
| Pass 6 (Responsive)  | 5/10 → 9/10                                 |
| Pass 7 (Decisions)   | 12 resolved · 0 deferred                    |
+--------------------------------------------------------------------+
| NOT in scope         | written (7 items)                           |
| What already exists  | written                                     |
| TODOs                | proposed after plan file                    |
| Approved Mockups     | — (text-only review)                        |
| Decisions made       | 12 added to plan                            |
| Decisions deferred   | 0                                           |
| Overall design score | 5/10 → 9/10                                 |
+====================================================================+
```

**Plan is design-complete.** Recommend `/plan-eng-review` next (required shipping gate) to validate the architectural implications (real waveform, inline processing state machine, nav restructure, component renames).

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR (PLAN) | score 5/10 → 9/10, 12 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **UNRESOLVED:** 0
- **VERDICT:** DESIGN CLEARED — eng review required before ship.
