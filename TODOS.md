# TODOS

## Design debt

### AI-slop 3-card grid sweep
- **What:** Audit other app pages (analytics, calendar, conversation, events, history, notes, queries, settings, tasks) for the "3-card grid with icon+title+description" pattern and replace with inline chips or row lists.
- **Why:** We identified this pattern in `DashboardRecorder` quick-access cards and decided to kill it in the dashboard. The pattern almost certainly recurs elsewhere and is the #2 AI-slop tell.
- **Pros:** Kills a repeat pattern across the app in one sweep; reinforces the industrial-clean aesthetic; lowers visual noise site-wide.
- **Cons:** Big refactor session; requires per-page design judgment on what replaces each grid.
- **Context:** Added 2026-04-18 during dashboard redesign plan review. The principle: cards earn existence. Icon-in-circle + bold title + truncated description is instant slop.
- **Depends on:** dashboard redesign ships first (establishes the chip replacement pattern).

### Real audio waveform mobile perf
- **What:** After dashboard ships with real audio-driven waveform, measure CPU impact on low-end Android devices and tune bar count / frame rate.
- **Why:** Plan uses Web Audio `AnalyserNode` + requestAnimationFrame to drive 24 bars at 60fps. We agreed to 30fps + reduced bar count on mobile as a mitigation, but it's untested.
- **Pros:** Ensures the honest-waveform decision doesn't degrade the experience on the devices that need it most.
- **Cons:** Requires physical low-end device testing or a telemetry rollout.
- **Context:** Added 2026-04-18. Decision in `docs/plans/dashboard-redesign-2026-04-18.md` issue 4 (real waveform over sine-wave or minimal).
- **Depends on:** dashboard redesign merged.
