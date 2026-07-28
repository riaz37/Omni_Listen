import { Suspense } from 'react';
import ConversationDetailClient from './ConversationDetailClient';
import { useConversationId } from '@/hooks/useConversationId';

function ConversationRoute() {
    const jobId = useConversationId();
    // Keying on jobId forces a brand-new ConversationDetailClient instance
    // whenever the id changes, instead of the same instance re-rendering with
    // new props. That guarantees no state (or in-flight request) from the
    // previously viewed meeting can ever bleed into the next one — this is
    // the fix for "processing a new recording shows the previous meeting"
    // (stale useSearchParams() on a statically-exported route).
    return <ConversationDetailClient key={jobId ?? 'none'} jobId={jobId} />;
}

export default function ConversationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ConversationRoute />
        </Suspense>
    );
}
