'use client';

import { Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileSectionProps {
  user: { name: string; email: string; picture?: string } | null;
  editingName: boolean;
  newName: string;
  setNewName: (name: string) => void;
  setEditingName: (editing: boolean) => void;
  handleUpdateName: () => void;
}

export function ProfileSection({
  user,
  editingName,
  newName,
  setNewName,
  setEditingName,
  handleUpdateName,
}: ProfileSectionProps) {
  return (
    <div className="bg-card rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Profile</h2>
      <div className="flex items-center gap-4">
        {user?.picture && (
          <img
            src={user.picture}
            alt={user.name}
            className="w-16 h-16 rounded-full"
          />
        )}
        <div className="flex-1">
          {editingName ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="Enter new name"
              />
              <div className="flex gap-2">
                <Button onClick={handleUpdateName} size="sm">
                  Save
                </Button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNewName('');
                  }}
                  className="px-3 py-1 border border-border text-foreground rounded-md hover:bg-muted text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div>
                <p className="font-medium text-foreground">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setEditingName(true);
                  setNewName(user?.name || '');
                }}
                className="px-3 py-1.5 bg-muted hover:bg-muted rounded-md flex items-center gap-2 text-sm text-foreground transition-colors"
                title="Edit name"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
