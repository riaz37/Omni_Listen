# Performance Audit & Fixes

## Frontend Changes Applied

### 1. Auth user caching (`lib/auth-context.tsx`)
- User object is now cached in `sessionStorage` after first successful auth check
- On subsequent loads, cached user is served immediately — `loading` resolves without a network round-trip
- `/api/auth/me` still revalidates in the background and updates state if the user changed
- Cache is cleared on logout

### 2. Merged duplicate `getAllEvents()` calls (`hooks/useDashboardData.ts`)
- `fetchUpcomingEvents` and `fetchTasks` previously both called `/api/all-events` independently on every dashboard load
- Merged into a single `fetchEventsAndTasks` function using one `Promise.all([getAllEvents(), getAllNotes()])`
- Halves the number of API calls on every dashboard visit

### 3. Eliminated post-toggle API refetch (`hooks/useDashboardData.ts`)
- `handleToggleTask` previously called `fetchUpcomingEvents()` after every task toggle, triggering a full API refetch
- Now updates both `tasks` and `upcomingEvents` local state directly — no network call on toggle

### 4. Removed duplicate polling interval (`app/(app)/listen/page.tsx`)
- `processAudio()` was creating its own `setInterval` at 2000ms to poll job status
- `GlobalStateProvider.startProcessing()` already starts polling via `pollJobStatus()` at the same interval
- Removed the duplicate. The navigation/vault-cleanup watcher now polls at 5000ms (less aggressive, navigation doesn't need 2s precision)

### 5. Lazy-loaded `react-big-calendar` (`app/(app)/calendar/page.tsx`)
- The calendar library and its CSS were eagerly bundled — loaded by every user on every page even if they never visit `/calendar`
- Now loaded via `next/dynamic` with `ssr: false`
- TypeScript generics preserved via explicit `ComponentType<CalendarProps<CalendarEvent>>` cast

### 6. Removed redundant sort in Queries page (`app/(app)/queries/page.tsx`)
- `fetchQueries()` sorted the result array immediately after building it
- `filteredQueries` memo already re-sorts on every filter/search change
- Removed the initial sort — memo handles it

### 7. Removed fake sync delay (`app/(app)/calendar/page.tsx`, `hooks/useEventsData.ts`)
- Both calendar and events pages had `await new Promise(resolve => setTimeout(resolve, 1000))` masquerading as a Google Calendar sync
- Nothing was actually synced. Replaced with a "not yet implemented" toast
- Eliminates a 1-second artificial block on every sync button click

---

## Backend TODO

The following changes require backend work. Assign to backend engineer.

---

### BE-1: Embed `meeting_title` in notes and events list responses

**Pain point:** `GET /api/all-notes` returns notes without the parent meeting title. The Notes page fetches `GET /api/meetings?limit=1000` as a second call just to resolve a display label per note.

**Fix:** Add `meeting_title` field on each note and event object in list responses.

```json
// Current
{ "id": 1, "title": "Budget review", "meeting_id": "abc123" }

// Expected
{ "id": 1, "title": "Budget review", "meeting_id": "abc123", "meeting_title": "Q3 Planning Call" }
```

---

### BE-2: Filter meetings by analysis presence

**Pain point:** `GET /api/meetings?limit=1000` is called on the Analysis/Queries page to filter client-side for meetings where `user_input_result` is not null. Downloads 1000 full records to render a fraction of them.

**Fix:** Add a `?has_analysis=true` query param that filters server-side.

```
GET /api/meetings?has_analysis=true&limit=50&offset=0
```

---

### BE-3: Add pagination to `/api/all-events` and `/api/all-notes`

**Pain point:** Both endpoints return all records with no pagination. Every page fetches the full dataset on mount. Will degrade badly at scale.

**Fix:** Add `limit` and `offset` params (same pattern as `/api/meetings`).

```
GET /api/all-events?limit=100&offset=0
GET /api/all-notes?limit=100&offset=0
```

---

### BE-4: Implement per-event Google Calendar sync endpoint

**Pain point:** Per-event sync buttons exist on Calendar and Events pages but the backend endpoint does not exist. Frontend has removed the fake 1s delay — buttons now show "not yet implemented".

**Fix:** Implement a per-event sync endpoint.

```
POST /api/events/:id/sync-calendar
```

Should mirror the existing `POST /api/meetings/:id/sync-calendar` but scoped to a single event.

---

### BE-5: Use a shorter default timeout for non-upload API calls

**Pain point:** The frontend axios instance has a global 5-minute timeout (set to accommodate large audio uploads). All other calls (auth, listings, etc.) inherit this — a hung request blocks the user for 5 minutes before showing an error.

**Fix:** Confirm a safe default timeout for standard endpoints (suggested: 15s). The frontend will apply the long timeout only to `POST /api/process-audio`.

---

### BE-6: Add cache headers to list endpoints

**Pain point:** `@tanstack/react-query` is installed but unused. The largest remaining performance win is a client-side cache so navigating between pages doesn't refetch `/api/all-events` on every visit. React Query can validate stale data against `ETag` or `Last-Modified` headers with no structural API changes.

**Fix:** Return `ETag` or `Last-Modified` on:
- `GET /api/all-events`
- `GET /api/all-notes`
- `GET /api/meetings`
- `GET /api/analytics`

No response shape changes required.
