'use client';

import { useState, useEffect } from 'react';
import { apiKeysAPI } from '@/lib/api';
import { Loader2, Plus, Trash2, Key } from 'lucide-react';

interface ApiKeyData {
    id: number;
    name: string | null;
    key_prefix: string;
    created_at: string;
}

export default function TestApiPage() {
    const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = async () => {
        try {
            const data = await apiKeysAPI.list();
            setApiKeys(Array.isArray(data) ? data : data.keys || []);
        } catch (err) {
            setError('Failed to load keys');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">API Key Test Page</h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <Loader2 className="animate-spin w-8 h-8" />
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Values: {apiKeys.length}</h2>
                        <button
                            onClick={loadKeys}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Refresh
                        </button>
                    </div>

                    {apiKeys.length === 0 ? (
                        <p className="text-muted-foreground">No API keys found.</p>
                    ) : (
                        <ul className="space-y-2">
                            {apiKeys.map(key => (
                                <li key={key.id} className="p-4 border rounded shadow-sm flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{key.name || 'Unnamed Key'}</div>
                                        <code className="text-sm bg-muted px-2 py-1 rounded mt-1 block w-fit">
                                            {key.key_prefix}...
                                        </code>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        ID: {key.id}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
