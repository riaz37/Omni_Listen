// Single place to link to a meeting's detail page. Previously call sites
// across the app hand-built `/conversation?id=${jobId}` — any future change
// to how that route identifies a meeting (see useConversationId.ts) had to
// be found and repeated at every one. Route through here instead.

// Locale-free path — for the rare call site that only has a generic
// onNavigate(path) callback and applies its own locale prefix (e.g.
// RecentConversationsCard).
export function conversationPath(jobId: string): string {
  return `/conversation?id=${encodeURIComponent(jobId)}`;
}

interface Router {
  push: (path: string) => void;
}

export function goToConversation(router: Router, lp: (path: string) => string, jobId: string): void {
  router.push(lp(conversationPath(jobId)));
}
