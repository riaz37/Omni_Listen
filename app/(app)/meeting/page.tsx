import { Suspense } from 'react';
import MeetingDetailClient from './MeetingDetailClient';

export default function MeetingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MeetingDetailClient />
        </Suspense>
    );
}
