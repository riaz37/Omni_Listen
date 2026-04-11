'use client';

import { useState, useEffect } from 'react';
import { X, User, Plus, Edit2, Trash2, Star, Lock, AlertCircle, ArrowLeft, Save } from 'lucide-react';
import { useConfig } from '@/lib/config-context';
import { presetsAPI, authAPI } from '@/lib/api';
import { toast } from 'sonner';
import {
  MotionDialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ConfirmDialog';

// Predefined system presets
import { SYSTEM_PRESETS } from '@/lib/presets';

interface Preset {
  id: number;
  name: string;
  config: {
    role: string;
    output_fields: Record<string, boolean>;
    user_input: string;
    custom_field_only?: boolean;
  };
  is_default: boolean;
  created_at?: string;
  is_system?: boolean;
}

interface RoleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelected?: (preset: Preset) => void;
  activeRoleName?: string | null;
}

export default function RoleConfigModal({ isOpen, onClose, onRoleSelected, activeRoleName }: RoleConfigModalProps) {
  const { config, setConfig } = useConfig();

  const [userPresets, setUserPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [isSystemTemplate, setIsSystemTemplate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Preset | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    output_fields: config.output_fields,
    user_input: '',
    custom_field_only: false,
  });

  // Load presets when modal opens - reset view to list
  useEffect(() => {
    if (isOpen) {
      setView('list');
      loadPresets();
    }
  }, [isOpen]);

  const loadPresets = async () => {
    try {
      setLoading(true);
      const response = await presetsAPI.getPresets();
      setUserPresets(response.presets || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = async (preset: Preset) => {
    try {
      setSaving(true);

      await authAPI.setActiveRole(preset.name);

      setConfig({
        ...config,
        role: preset.config.role,
        output_fields: preset.config.output_fields as any,
        user_input: preset.config.user_input || '',
        custom_field_only: preset.config.custom_field_only || false,
      });

      if (onRoleSelected) {
        onRoleSelected(preset);
      }

      toast.success(`Switched to ${preset.name}`, { duration: 2000 });

      await new Promise(resolve => setTimeout(resolve, 50));

      onClose();
    } catch (error) {
      toast.error('Failed to save role selection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = () => {
    setEditingPreset(null);
    setIsSystemTemplate(false);
    setFormData({
      name: '',
      role: '',
      output_fields: config.output_fields,
      user_input: '',
      custom_field_only: false,
    });
    setView('edit');
  };

  const handleEdit = (preset: Preset) => {
    if (preset.is_system) {
      setEditingPreset(null);
      setIsSystemTemplate(true);
      setFormData({
        name: preset.name,
        role: preset.config.role,
        output_fields: preset.config.output_fields as any,
        user_input: preset.config.user_input || '',
        custom_field_only: preset.config.custom_field_only || false,
      });
    } else {
      setEditingPreset(preset);
      setIsSystemTemplate(false);
      setFormData({
        name: preset.name,
        role: preset.config.role,
        output_fields: preset.config.output_fields as any,
        user_input: preset.config.user_input || '',
        custom_field_only: preset.config.custom_field_only || false,
      });
    }
    setView('edit');
  };

  const handleSavePreset = async () => {
    try {
      setSaving(true);
      const data = {
        name: formData.name,
        config: {
          role: formData.role,
          output_fields: formData.output_fields,
          user_input: formData.user_input,
          custom_field_only: formData.custom_field_only,
        },
      };

      if (editingPreset) {
        await presetsAPI.updatePreset(editingPreset.id, data);
        toast.success('Preset updated successfully!', { duration: 2000 });
      } else {
        await presetsAPI.createPreset(data);
        toast.success('Preset created successfully!', { duration: 2000 });
      }

      await loadPresets();
      setView('list');
    } catch (error) {
      toast.error('Failed to save preset. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (preset: Preset) => {
    setDeleteConfirm(preset);
  };

  const executeDelete = async (preset: Preset) => {
    try {
      await presetsAPI.deletePreset(preset.id);
      toast.success(`Deleted "${preset.name}"`, { duration: 2000 });
      await loadPresets();
    } catch (error) {
      toast.error('Failed to delete preset. Please try again.');
    }
  };

  const handleSetDefault = async (preset: Preset) => {
    try {
      await presetsAPI.setDefaultPreset(preset.id);
      toast.success(`Set "${preset.name}" as default`, { duration: 2000 });
      await loadPresets();
    } catch (error) {
      toast.error('Failed to set default. Please try again.');
    }
  };

  const renderPresetCard = (preset: Preset) => {
    const isActive = activeRoleName === preset.name;

    return (
      <div
        key={preset.id}
        className={`group relative rounded-lg border transition-colors duration-200 p-5 ${
          isActive
            ? 'bg-primary/5 border-primary'
            : 'bg-card border-border hover:border-muted-foreground/25'
        }`}
      >
        {/* Header row: name + badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-foreground truncate">{preset.name}</h3>
              {preset.is_system && (
                <span className="shrink-0 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-muted-foreground border border-border rounded">
                  System
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{preset.config.role}</span>
            </p>
          </div>
          {preset.is_default && (
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
          )}
        </div>

        {/* Optional metadata */}
        {(preset.config.user_input || preset.config.custom_field_only) && (
          <div className="space-y-2 mb-4">
            {preset.config.user_input && (
              <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/50 dark:bg-muted/20 px-2.5 py-2 rounded border border-border">
                {preset.config.user_input}
              </p>
            )}
            {preset.config.custom_field_only && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/70 bg-muted/50 dark:bg-muted/20 px-2 py-1 rounded border border-border w-fit">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Custom analysis only
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-border">
          <Button
            onClick={() => handleSelectPreset(preset)}
            disabled={isActive || saving}
            loading={saving && !isActive}
            className={`flex-1 ${
              isActive
                ? 'bg-primary/10 text-primary cursor-default border border-primary/20 hover:bg-primary/10'
                : ''
            }`}
          >
            {isActive ? 'Active' : (saving ? 'Saving...' : 'Apply')}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(preset)}
            className="h-auto w-auto p-2 text-muted-foreground hover:text-foreground"
            title={preset.is_system ? "Customize this template" : "Edit preset"}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          {!preset.is_system && (
            <>
              {!preset.is_default && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSetDefault(preset)}
                  className="h-auto w-auto p-2 text-muted-foreground hover:text-foreground"
                  title="Set as default"
                >
                  <Star className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(preset)}
                className="h-auto w-auto p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Delete preset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <MotionDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" hideClose>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view === 'edit' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('list')}
                className="h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground"
                title="Back to list"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <DialogTitle>
              {view === 'list' ? 'Manage Presets' : (editingPreset ? 'Edit Preset' : (isSystemTemplate ? 'Customize Template' : 'Create Preset'))}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            {view === 'edit' && isSystemTemplate && (
              <Button
                onClick={handleSavePreset}
                disabled={saving || !formData.name || !formData.role || (formData.custom_field_only && !formData.user_input)}
                loading={saving}
                size="sm"
                iconLeft={!saving ? <Save className="w-3.5 h-3.5" /> : undefined}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto custom-scrollbar">

          {view === 'list' ? (
            <div className="space-y-8">
              {/* User Presets Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                      My Presets
                    </h3>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {userPresets.length}
                    </span>
                  </div>
                  <Button
                    onClick={handleCreateNew}
                    size="sm"
                    iconLeft={<Plus className="w-3.5 h-3.5" />}
                  >
                    Create new
                  </Button>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="rounded-lg border border-border p-4 animate-pulse">
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-4 bg-muted rounded w-32" />
                          <div className="flex gap-2">
                            <div className="w-7 h-7 bg-muted rounded" />
                            <div className="w-7 h-7 bg-muted rounded" />
                          </div>
                        </div>
                        <div className="h-3 bg-muted rounded w-full mb-2" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : userPresets.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No custom presets yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Create one above or customize a system template below.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userPresets.map(renderPresetCard)}
                  </div>
                )}
              </div>

              {/* System Presets Section */}
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
                  System Templates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SYSTEM_PRESETS.map(renderPresetCard)}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Edit/Create Form */}
              {isSystemTemplate ? (
                /* Customize Template (single-column layout) */
                <>
                  <div className="bg-muted/50 dark:bg-muted/20 border border-border rounded-lg p-4 mb-6 text-sm text-muted-foreground">
                    You are customizing a system template. The name and role are fixed, but you can add a default analysis request and modify output fields.
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label>
                        Preset Name <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          value={formData.name}
                          disabled
                          className="pr-10"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Role <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          value={formData.role}
                          disabled
                          className="pr-10"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>
                          Default Analysis Request {formData.custom_field_only ? <span className="text-destructive">*</span> : <span className="text-muted-foreground font-normal">(optional)</span>}
                        </Label>
                        {formData.custom_field_only && !formData.user_input && (
                          <span className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Required when custom analysis is enabled
                          </span>
                        )}
                      </div>
                      <Textarea
                        value={formData.user_input}
                        onChange={(e) => setFormData({ ...formData, user_input: e.target.value })}
                        placeholder="Enter a default analysis request that will auto-fill when this preset is selected..."
                        rows={3}
                        className={formData.custom_field_only && !formData.user_input ? 'border-destructive/50 bg-destructive/5' : ''}
                      />
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="custom_field_only"
                            checked={formData.custom_field_only}
                            onCheckedChange={(checked) => setFormData({ ...formData, custom_field_only: checked === true })}
                          />
                          <label htmlFor="custom_field_only" className="text-sm cursor-pointer">
                            Only process additional analysis (skip standard extraction)
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Output Fields</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(formData.output_fields || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 capitalize">
                            <Checkbox
                              id={`output-field-${key}`}
                              checked={value}
                              onCheckedChange={(checked) =>
                                setFormData({
                                  ...formData,
                                  output_fields: { ...formData.output_fields, [key]: checked === true },
                                })
                              }
                            />
                            <label htmlFor={`output-field-${key}`} className="text-sm cursor-pointer">
                              {key.replace(/_/g, ' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Create / Edit Preset (two-column layout) */
                <>
                  <p className="text-base text-muted-foreground mb-8">What are you having problems with?</p>
                  <div className="flex gap-12">
                    {/* Left column - form fields */}
                    <div className="flex-1 space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="preset-name">
                          Preset Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="preset-name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Give your preset a name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preset-role">Preset Role</Label>
                        <Input
                          id="preset-role"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          placeholder="Define the AI role"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preset-description">Description</Label>
                        <Textarea
                          id="preset-description"
                          value={formData.user_input}
                          onChange={(e) => setFormData({ ...formData, user_input: e.target.value })}
                          placeholder="Describe what this preset should do..."
                          rows={5}
                          className="resize-y"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="custom_field_only_create"
                          checked={formData.custom_field_only}
                          onCheckedChange={(checked) => setFormData({ ...formData, custom_field_only: checked === true })}
                        />
                        <label htmlFor="custom_field_only_create" className="text-sm cursor-pointer">
                          Only process additional analysis (skip standard extraction)
                        </label>
                      </div>
                    </div>

                    {/* Right column - output fields */}
                    <div className="w-72 shrink-0">
                      <Label className="mb-4 block">Output Fields</Label>
                      <div className="space-y-3.5">
                        {Object.entries(formData.output_fields || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 capitalize">
                            <Checkbox
                              id={`output-field-create-${key}`}
                              checked={value}
                              onCheckedChange={(checked) =>
                                setFormData({
                                  ...formData,
                                  output_fields: { ...formData.output_fields, [key]: checked === true },
                                })
                              }
                            />
                            <label htmlFor={`output-field-create-${key}`} className="text-sm cursor-pointer">
                              {key.replace(/_/g, ' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="gap-2 pt-6 border-t border-border sm:justify-between">
                    <Button variant="outline" size="lg" onClick={() => setView('list')}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSavePreset}
                      disabled={saving || !formData.name || !formData.role || (formData.custom_field_only && !formData.user_input)}
                      loading={saving}
                      size="lg"
                    >
                      Submit
                    </Button>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          title="Delete Preset"
          message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => {
            executeDelete(deleteConfirm);
            setDeleteConfirm(null);
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </MotionDialog>
  );
}
