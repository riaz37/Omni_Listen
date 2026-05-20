'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, Loader2, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { apiKeysAPI } from '@/lib/api';
import { SettingsSection } from './SettingsSection';
import { useConfirmDialog } from './ConfirmDialogContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import PasswordConfirmDialog from '@/components/PasswordConfirmDialog';
import { useTranslation } from '@/lib/i18n/use-translation';
import type { ApiKeyData } from './types';

export function ApiKeysSection() {
  const { confirm } = useConfirmDialog();
  const { user } = useRequireAuth();
  const { t } = useTranslation();
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeTargetId, setRevokeTargetId] = useState<number | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const data = await apiKeysAPI.list();
      const list = Array.isArray(data) ? data : (data.keys || []);
      setApiKeys(list);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const data = await apiKeysAPI.create(newName);
      setNewSecret(data.key);
      await loadKeys();
      setNewName('');
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = (id: number) => {
    if (user?.has_password) {
      setRevokeTargetId(id);
      setRevokeError(null);
      setRevokeDialogOpen(true);
    } else {
      confirm({
        title: t('settings.apikeys.revoke_title'),
        message: t('settings.apikeys.revoke_msg'),
        confirmLabel: t('settings.apikeys.revoke_btn'),
        variant: 'danger',
        onConfirm: async () => {
          try {
            await apiKeysAPI.revoke(id);
            await loadKeys();
          } catch {
            // silent
          }
        },
      });
    }
  };

  const handleRevokeWithPassword = async (password: string) => {
    if (revokeTargetId === null) return;
    setRevoking(true);
    setRevokeError(null);
    try {
      await apiKeysAPI.revoke(revokeTargetId, password);
      await loadKeys();
      setRevokeDialogOpen(false);
      setRevokeTargetId(null);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { detail?: string } } })?.response?.status;
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (status === 403) {
        setRevokeError(detail ?? 'Wrong password. Please try again.');
      } else {
        setRevokeDialogOpen(false);
        setRevokeTargetId(null);
      }
    } finally {
      setRevoking(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setNewName('');
    setNewSecret(null);
    setCopied(false);
  };

  const copySecret = async () => {
    if (!newSecret) return;
    await navigator.clipboard.writeText(newSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <SettingsSection
        id="api-keys"
        icon={<Key className="w-5 h-5 text-primary" />}
        title={t('settings.apikeys.title')}
        action={
          <Button onClick={() => setModalOpen(true)} iconLeft={<Plus className="w-4 h-4" />} size="sm">
            {t('settings.apikeys.create_btn')}
          </Button>
        }
      >
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8 bg-muted/50 rounded-lg border border-dashed border-border">
            <Key className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">{t('settings.apikeys.empty_title')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('settings.apikeys.empty_desc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map(key => (
              <div key={key.id} className="p-4 rounded-lg bg-muted/50 border border-border flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-foreground">{key.name || t('settings.apikeys.unnamed_key')}</div>
                  <code className="text-xs bg-muted px-2 py-0.5 rounded mt-1 block w-fit text-muted-foreground font-mono">
                    {key.key_prefix}...
                  </code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(key.created_at).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRevoke(key.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>

      <MotionDialog open={modalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newSecret ? t('settings.apikeys.modal_created_title') : t('settings.apikeys.modal_create_title')}</DialogTitle>
            {!newSecret && (
              <DialogDescription>{t('settings.apikeys.modal_create_desc')}</DialogDescription>
            )}
          </DialogHeader>

          {newSecret ? (
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t('settings.apikeys.key_generated')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('settings.apikeys.key_copy_note')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-muted p-3 rounded-lg border border-border font-mono text-sm break-all flex items-center justify-between gap-2">
                <span className="text-foreground">{newSecret}</span>
                <Button variant="ghost" size="icon" onClick={copySecret} className="shrink-0">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={closeModal}>{t('settings.apikeys.done')}</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key-name">{t('settings.apikeys.label_key_name')}</Label>
                <Input
                  id="api-key-name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder={t('settings.apikeys.key_name_placeholder')}
                  className="mt-1.5"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) handleCreate(); }}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>{t('common.cancel')}</Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newName.trim() || creating}
                  loading={creating}
                >
                  {t('settings.apikeys.create_key_btn')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </MotionDialog>

      <PasswordConfirmDialog
        isOpen={revokeDialogOpen}
        title={t('settings.apikeys.revoke_pw_title')}
        description={t('settings.apikeys.revoke_pw_desc')}
        confirmLabel={t('settings.apikeys.revoke_btn')}
        isLoading={revoking}
        error={revokeError}
        onConfirm={handleRevokeWithPassword}
        onCancel={() => {
          if (!revoking) {
            setRevokeDialogOpen(false);
            setRevokeTargetId(null);
            setRevokeError(null);
          }
        }}
      />
    </>
  );
}
