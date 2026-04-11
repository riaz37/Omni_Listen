'use client';

import { useState } from 'react';
import { User, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SettingsSection } from './SettingsSection';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export function ProfileSection() {
  const { user, refreshUser } = useRequireAuth();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      await authAPI.updateProfile(newName);
      await refreshUser();
      setEditing(false);
      setNewName('');
    } catch {
      toast.error('Failed to update name');
    }
  };

  return (
    <SettingsSection
      id="profile"
      icon={<User className="w-5 h-5" />}
      title="Profile"
    >
      <div className="flex items-center gap-4">
        {user?.picture && (
          <img
            src={user.picture}
            alt={user.name}
            className="w-14 h-14 rounded-full border border-border"
          />
        )}
        <div className="flex-1">
          {editing ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="profile-name">Display name</Label>
                <Input
                  id="profile-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter new name"
                  className="mt-1.5"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateName();
                    if (e.key === 'Escape') { setEditing(false); setNewName(''); }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateName} size="sm">
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEditing(false); setNewName(''); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div>
                <p className="font-medium text-foreground">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setEditing(true); setNewName(user?.name || ''); }}
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}
