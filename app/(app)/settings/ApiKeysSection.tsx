'use client';

import { createPortal } from 'react-dom';
import { Key, Plus, Loader2, Trash2, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApiKeyData {
  id: number;
  name: string | null;
  key_prefix: string;
  created_at: string;
}

interface ApiKeysSectionProps {
  apiKeys: ApiKeyData[];
  apiKeysLoading: boolean;
  showApiKeyModal: boolean;
  apiKeyCreating: boolean;
  newApiKeyName: string;
  newKeySecret: string | null;
  setShowApiKeyModal: (show: boolean) => void;
  setNewApiKeyName: (name: string) => void;
  handleCreateApiKey: () => void;
  handleRevokeApiKey: (id: number) => void;
  closeApiKeyModal: () => void;
}

export function ApiKeysSection({
  apiKeys,
  apiKeysLoading,
  showApiKeyModal,
  apiKeyCreating,
  newApiKeyName,
  newKeySecret,
  setShowApiKeyModal,
  setNewApiKeyName,
  handleCreateApiKey,
  handleRevokeApiKey,
  closeApiKeyModal,
}: ApiKeysSectionProps) {
  return (
    <>
      <div className="bg-card rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            API Keys
          </h2>
          <Button onClick={() => setShowApiKeyModal(true)} iconLeft={<Plus className="w-4 h-4" />} size="sm">
            Create Key
          </Button>
        </div>

        {apiKeysLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading API keys...</p>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8 bg-muted rounded-lg border border-dashed border-border">
            <Key className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No API keys found.</p>
            <p className="text-sm text-muted-foreground">Create a key to access the API programmatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map(key => (
              <div key={key.id} className="p-4 border rounded-lg hover:shadow-sm transition-all flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">{key.name || 'Unnamed Key'}</div>
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-1 block w-fit text-muted-foreground font-mono">
                    {key.key_prefix}...
                  </code>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Created: {new Date(key.created_at).toLocaleDateString()}
                  </span>
                  <button onClick={() => handleRevokeApiKey(key.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded hover:scale-105 transition-transform" title="Revoke Key">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Key Modal — portal to body to escape framer-motion transforms */}
      {showApiKeyModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-lg p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">
                {newKeySecret ? 'API Key Created' : 'Create API Key'}
              </h3>
              <button onClick={closeApiKeyModal} className="text-muted-foreground hover:text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {newKeySecret ? (
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-success">Key generated successfully!</h4>
                      <p className="text-sm text-text-primary mt-1">
                        Copy this key now. You won't be able to see it again!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-md border font-mono text-sm break-all flex items-center justify-between gap-2">
                  <span>{newKeySecret}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newKeySecret);
                    }}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-card rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    <Key className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-end mt-6">
                  <button onClick={closeApiKeyModal} className="px-4 py-2 bg-foreground text-white rounded-md hover:bg-foreground/90">
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Key Name</label>
                  <input
                    type="text"
                    value={newApiKeyName}
                    onChange={e => setNewApiKeyName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g. My Script"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={closeApiKeyModal} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-md">Cancel</button>
                  <Button
                    onClick={handleCreateApiKey}
                    disabled={!newApiKeyName.trim() || apiKeyCreating}
                    loading={apiKeyCreating}
                  >
                    Create Key
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
