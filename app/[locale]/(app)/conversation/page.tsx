import { Suspense } from 'react';
import ConversationDetailClient from './ConversationDetailClient';

export default function ConversationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ConversationDetailClient />
        </Suspense>
    );
}
