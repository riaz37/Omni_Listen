# Arabic Localization + RTL Migration

## Overview

Full bilingual product (EN/AR) with URL-based locale routing, lightweight custom
i18n layer, and RTL layout following the shadcn approach.

**Scope:** Marketing pages + auth flow + authenticated dashboard (full app)

---

## Decisions

| Area | Choice | Rationale |
|------|--------|-----------|
| Routing | URL-based `/en`, `/ar` prefix | SEO-friendly, shareable, server-rendered correct `dir` |
| i18n infra | Lightweight custom (JSON dictionaries + `useTranslation` hook) | Matches existing patterns, no heavy framework |
| RTL method | CSS logical properties + Radix `DirectionProvider` + `rtl:` variants | shadcn-native, no extra plugin |
| Arabic font | Noto Sans Arabic (Google Fonts) | Pairs well with Geist, recommended by shadcn RTL docs |

---

## Architecture

### 1. Route Restructure

Move all routes under `app/[locale]/` so the root layout can render `<html lang dir>` server-side.

**Before:**
```
app/
  layout.tsx
  (app)/...
  (marketing)/...
  signin/ signup/ verify-email/ forgot-password/ reset-password/
  mini/ autonomous/ offline/ test-api/
```

**After:**
```
app/
  globals.css              (stays)
  [locale]/
    layout.tsx             (NEW root — renders <html lang dir>, loads dictionary)
    (app)/...              (moved)
    (marketing)/...        (moved)
    signin/ signup/ ...    (moved)
    mini/ autonomous/ ...  (moved — see Electron note)
```

`app/[locale]/layout.tsx` responsibilities:
- Render `<html lang={locale} dir={dir}>`
- Load dictionary server-side via `getDictionary(locale)`
- Wrap children in `<I18nProvider>` + Radix `<DirectionProvider>`
- Apply Arabic font CSS variable when `locale === 'ar'`
- Export `generateStaticParams` → `[{locale:'en'},{locale:'ar'}]`

> **Electron note:** `mini`, `autonomous`, `offline` windows move from `/mini` to
> `/en/mini`. Update URLs in the Electron main process after migration.

### 2. Middleware (`middleware.ts`)

Detects locale and redirects un-prefixed paths:

```ts
// Resolution order:
// 1. NEXT_LOCALE cookie
// 2. Accept-Language header
// 3. defaultLocale ('en')

// matcher excludes: _next/static, _next/image, favicon, API routes
```

### 3. i18n Layer (`lib/i18n/`)

```
lib/i18n/
  config.ts               locales, defaultLocale, dir map
  get-dictionary.ts       server-side loader (dynamic import per locale)
  I18nProvider.tsx        client context — locale + dictionary
  use-translation.ts      useTranslation() → { t, locale, dir }
  dictionaries/
    en.json               namespaced keys
    ar.json               Arabic translations
```

**Dictionary namespace structure:**
```json
{
  "common": { "loading": "...", "error": "..." },
  "nav": { "home": "...", "history": "...", "settings": "..." },
  "marketing": { "hero.title": "...", "pricing.title": "..." },
  "auth": { "signin.title": "...", "signup.cta": "..." },
  "dashboard": { "listen.start": "...", "notes.empty": "..." }
}
```

**Usage:**
```tsx
const { t, locale, dir } = useTranslation()
<h1>{t('marketing.hero.title')}</h1>
```

**Migration:** Existing `lib/language-context.tsx` consumers (`terms`, `cookies` pages)
move to this layer, then `language-context.tsx` is deleted.

### 4. RTL (shadcn Method)

**Step 1 — shadcn CLI migration:**
```bash
npx shadcn@latest add direction
npx shadcn@latest migrate rtl components/ui
```
Auto-converts `left-*` → `start-*`, slide animations → logical equivalents.
Review every diff — components are customized.

**Step 2 — Convert ~181 directional classes in app/components:**

| Physical class | Logical equivalent |
|----------------|--------------------|
| `ml-*` / `mr-*` | `ms-*` / `me-*` |
| `pl-*` / `pr-*` | `ps-*` / `pe-*` |
| `left-*` / `right-*` (positioning) | `start-*` / `end-*` |
| `text-left` / `text-right` | `text-start` / `text-end` |
| `border-l` / `border-r` | `border-s` / `border-e` |
| `rounded-l-*` / `rounded-r-*` | `rounded-s-*` / `rounded-e-*` |

**Step 3 — Directional icons:** add `rtl:rotate-180`

Critical files:
- `components/Pagination.tsx` — `ChevronLeft` / `ChevronRight`
- `components/landing/Hero.tsx` — `ArrowRight` + `translate-x-1`
- `components/RoleConfigModal.tsx` — `ArrowLeft`
- `components/landing/{PricingTeaser,Testimonials,CallToAction}.tsx`

**Step 4 — Fixed-position widgets:** `right-6` → `end-6`
- `components/FloatingChat.tsx`
- `components/FloatingStatusIndicator.tsx`
- `components/MorningBriefingCard.tsx` (tooltip `left-full ml-3`)

**Step 5 — Complete partial RTL** in `app/[locale]/(app)/conversation/ConversationKeyTakeaways.tsx`
(already has `dir="rtl"` but uses physical `pl-4`, `mr-2`, `ml-2`).

### 5. Arabic Font

```ts
// app/[locale]/layout.tsx
import { Noto_Sans_Arabic } from 'next/font/google'

const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
})
```

```css
/* globals.css */
:lang(ar) {
  font-family: var(--font-arabic), var(--font-geist-sans), sans-serif;
}
```

### 6. Language Switcher (`components/LanguageSwitcher.tsx`)

- Uses `usePathname()` + replaces locale segment to build target URL.
- Sets `NEXT_LOCALE` cookie (persists on reload).
- Placed in `components/landing/LandingNav.tsx` and `components/Navigation.tsx`.

---

## Migration Phases

### Phase 1 — Routing + i18n Scaffold
**Goal:** App builds and renders at `/en` and `/ar` (English copy, correct `dir`)

- [ ] Move all routes under `app/[locale]/`
- [ ] Create `app/[locale]/layout.tsx` with `<html lang dir>`, providers, font
- [ ] Create `middleware.ts` — locale detection + redirect
- [ ] Create `lib/i18n/` — config, dictionary files (skeleton), loader, provider, hook
- [ ] Wire `DirectionProvider` and `I18nProvider` into layout
- [ ] Add Noto Sans Arabic font
- [ ] Build passes, `/en` and `/ar` both serve

### Phase 2 — RTL Layout Pass
**Goal:** Layout mirrors correctly at `/ar`

- [ ] `npx shadcn@latest add direction` + `migrate rtl components/ui`
- [ ] Review and fix shadcn component diffs
- [ ] Convert directional classes in `components/` → logical properties
- [ ] Convert directional classes in `app/[locale]/(app)/` pages
- [ ] Add `rtl:rotate-180` to directional icons
- [ ] Fix fixed-position widgets
- [ ] Complete `ConversationKeyTakeaways.tsx` RTL
- [ ] Visual verify at `/ar` — layout mirrors correctly

### Phase 3 — Translation Extraction (incremental)
**Goal:** All UI strings behind `t()` keys with EN + AR content

- [ ] `common.*` + `nav.*` — shared strings, navigation labels
- [ ] `marketing.*` — landing, pricing, about, contact, FAQ, legal
- [ ] `auth.*` — signin, signup, verify-email, forgot-password, reset-password
- [ ] `dashboard.*` — listen, history, notes, tasks, calendar, queries, analytics, settings, conversation
- [ ] Migrate `terms`/`cookies` off `language-context`, delete `language-context.tsx`

> **Arabic copy:** Dictionary infrastructure is built in Phase 1. Filling
> `ar.json` with correct Arabic text requires translator input per namespace.

### Phase 4 — Language Switcher
- [ ] Build `LanguageSwitcher.tsx` component
- [ ] Wire into `LandingNav.tsx` (marketing)
- [ ] Wire into `Navigation.tsx` (dashboard)
- [ ] Cookie persistence tested

### Phase 5 — Verification
- [ ] `npm run build` clean
- [ ] `/` redirects to `/en`; `/ar` loads with `dir="rtl"`
- [ ] Language switcher toggles locale, preserves path, persists cookie
- [ ] RTL spot-check: nav, sidebar, sheets, dropdowns, dialogs, pagination arrows
- [ ] All dashboard pages render correctly at `/ar`
- [ ] Electron: `mini`/`autonomous`/`offline` windows load at locale-prefixed URLs
- [ ] `/browse` visual QA — compare `/en` vs `/ar` pages

---

## Critical Files

| File | Change |
|------|--------|
| `app/layout.tsx` | **Delete** — replaced by `[locale]/layout.tsx` |
| `app/[locale]/layout.tsx` | **NEW** — root layout with lang/dir/providers/font |
| `middleware.ts` | **NEW** — locale detection + redirect |
| `lib/i18n/config.ts` | **NEW** |
| `lib/i18n/get-dictionary.ts` | **NEW** |
| `lib/i18n/I18nProvider.tsx` | **NEW** |
| `lib/i18n/use-translation.ts` | **NEW** |
| `lib/i18n/dictionaries/en.json` | **NEW** |
| `lib/i18n/dictionaries/ar.json` | **NEW** |
| `lib/language-context.tsx` | **Delete** after Phase 3 |
| `components/LanguageSwitcher.tsx` | **NEW** |
| `components/ui/{sheet,dropdown,dialog,date-picker,time-picker}.tsx` | RTL via shadcn migrate |
| `components/Navigation.tsx` | Logical classes + switcher |
| `components/landing/LandingNav.tsx` | Logical classes + switcher |
| `components/Pagination.tsx` | `rtl:rotate-180` on chevrons |
| `components/FloatingChat.tsx` | `end-6` |
| `components/FloatingStatusIndicator.tsx` | `end-6` |
| `components/landing/Hero.tsx` | `rtl:rotate-180` on arrow |
| `app/[locale]/(app)/conversation/ConversationKeyTakeaways.tsx` | Complete partial RTL |
| `tailwind.config.js` | Arabic font variable |
| `app/globals.css` | `:lang(ar)` font selector |
| `DESIGN.md` | Document Arabic font stack |
