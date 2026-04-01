'use client';

import { useState } from 'react';

export default function ApiKeyCard() {
    const [test, setTest] = useState('Hello');

    return (
        <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">API Keys (useState Test)</h2>
            <p className="text-muted-foreground">State value: {test}</p>
            <button onClick={() => setTest('Clicked!')} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">
                Change
            </button>
        </div>
    );
}
