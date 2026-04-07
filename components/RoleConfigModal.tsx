'use client';

import { useState, useEffect } from 'react';
import { X, User, Settings, Plus, Edit2, Trash2, Star, Copy, Lock, AlertCircle, Loader2, ArrowLeft, Save } from 'lucide-react';
import { useConfig } from '@/lib/config-context';
import { presetsAPI, authAPI } from '@/lib/api';
import { useToast } from './Toast';
import AnimatedModal from '@/components/ui/animated-modal';
import Checkbox from '@/components/ui/checkbox';

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
  const toast = useToast();
  const [userPresets, setUserPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [isSystemTemplate, setIsSystemTemplate] = useState(false);
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
      setView('list'); // Always start with list view when opening
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

      // Save active role to backend for cross-device persistence
      await authAPI.setActiveRole(preset.name);

      // Apply preset to current config
      setConfig({
        ...config,
        role: preset.config.role,
        output_fields: preset.config.output_fields as any,
        user_input: preset.config.user_input || '',
        custom_field_only: preset.config.custom_field_only || false,
      });

      // Notify parent and wait for state update
      if (onRoleSelected) {
        onRoleSelected(preset);
      }

      // Show success toast
      toast.success(`Switched to ${preset.name}`, 2000);

      // Small delay to ensure state updates propagate before closing
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
      // For system presets, we create a copy but keep the name/role locked
      setEditingPreset(null); // null means create new (in DB)
      setIsSystemTemplate(true);
      setFormData({
        name: preset.name, // Keep original name
        role: preset.config.role,
        output_fields: preset.config.output_fields as any,
        user_input: preset.config.user_input || '',
        custom_field_only: preset.config.custom_field_only || false,
      });
    } else {
      // For user presets, we edit the existing one
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
        // Update existing
        await presetsAPI.updatePreset(editingPreset.id, data);
        toast.success('Preset updated successfully!', 2000);
      } else {
        // Create new
        await presetsAPI.createPreset(data);
        toast.success('Preset created successfully!', 2000);
      }

      await loadPresets();
      setView('list');
    } catch (error) {
      toast.error('Failed to save preset. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (preset: Preset) => {
    if (!confirm(`Delete preset "${preset.name}"?`)) return;

    try {
      await presetsAPI.deletePreset(preset.id);
      toast.success(`Deleted "${preset.name}"`, 2000);
      await loadPresets();
    } catch (error) {
      toast.error('Failed to delete preset. Please try again.');
    }
  };

  const handleSetDefault = async (preset: Preset) => {
    try {
      await presetsAPI.setDefaultPreset(preset.id);
      toast.success(`Set "${preset.name}" as default`, 2000);
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
          <button
            onClick={() => handleSelectPreset(preset)}
            disabled={isActive || saving}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary cursor-default border border-primary/20'
                : saving
                  ? 'bg-primary/70 text-primary-foreground cursor-wait'
                  : 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : isActive ? (
              'Active'
            ) : (
              'Apply'
            )}
          </button>

          <button
            onClick={() => handleEdit(preset)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
            title={preset.is_system ? "Customize this template" : "Edit preset"}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {!preset.is_system && (
            <>
              {!preset.is_default && (
                <button
                  onClick={() => handleSetDefault(preset)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                  title="Set as default"
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => handleDelete(preset)}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                title="Delete preset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatedModal open={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="bg-card rounded-xl border border-border max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {view === 'edit' && (
              <button
                onClick={() => setView('list')}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                title="Back to list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-foreground">
              {view === 'list' ? 'Manage Presets' : (editingPreset ? 'Edit Preset' : (isSystemTemplate ? 'Customize Template' : 'Create Preset'))}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {view === 'edit' && isSystemTemplate && (
              <button
                onClick={handleSavePreset}
                disabled={saving || !formData.name || !formData.role || (formData.custom_field_only && !formData.user_input)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">

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
                  <button
                    onClick={handleCreateNew}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover text-sm font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create new
                  </button>
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
                /* ── Customize Template (single-column layout) ── */
                <>
                  <div className="bg-muted/50 dark:bg-muted/20 border border-border rounded-lg p-4 mb-6 text-sm text-muted-foreground">
                    You are customizing a system template. The name and role are fixed, but you can add a default analysis request and modify output fields.
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Preset Name <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.name}
                          disabled
                          className="w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground border-border cursor-not-allowed text-sm"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Role <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.role}
                          disabled
                          className="w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground border-border cursor-not-allowed text-sm"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-foreground">
                          Default Analysis Request {formData.custom_field_only ? <span className="text-destructive">*</span> : <span className="text-muted-foreground font-normal">(optional)</span>}
                        </label>
                        {formData.custom_field_only && !formData.user_input && (
                          <span className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Required when custom analysis is enabled
                          </span>
                        )}
                      </div>
                      <textarea
                        value={formData.user_input}
                        onChange={(e) => setFormData({ ...formData, user_input: e.target.value })}
                        placeholder="Enter a default analysis request that will auto-fill when this preset is selected..."
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm ${formData.custom_field_only && !formData.user_input ? 'border-destructive/50 bg-destructive/5' : 'border-border'}`}
                      />
                      <div className="mt-3">
                        <Checkbox
                          id="custom_field_only"
                          checked={formData.custom_field_only}
                          onChange={(checked) => setFormData({ ...formData, custom_field_only: checked })}
                          label="Only process additional analysis (skip standard extraction)"
                          size="sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Output Fields
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(formData.output_fields || {}).map(([key, value]) => (
                          <Checkbox
                            key={key}
                            checked={value}
                            onChange={(checked) =>
                              setFormData({
                                ...formData,
                                output_fields: { ...formData.output_fields, [key]: checked },
                              })
                            }
                            label={key.replace(/_/g, ' ')}
                            size="sm"
                            className="capitalize"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* ── Create / Edit Preset (two-column layout matching Figma) ── */
                <>
                  <p className="text-base text-muted-foreground mb-8">What are you having problems with?</p>
                  <div className="flex gap-12">
                    {/* Left column — form fields */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <label className="block text-base font-bold text-foreground mb-2">
                          Preset Name<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="I need help with..."
                          className="w-full px-4 py-3 border border-border rounded-lg bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-base text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div>
                        <label className="block text-base font-bold text-foreground mb-2">
                          Preset Role
                        </label>
                        <input
                          type="text"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          placeholder="I need help with..."
                          className="w-full px-4 py-3 border border-border rounded-lg bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-base text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div>
                        <label className="block text-base font-bold text-foreground mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.user_input}
                          onChange={(e) => setFormData({ ...formData, user_input: e.target.value })}
                          placeholder="Please include all information relevant to your issue."
                          rows={5}
                          className="w-full px-4 py-3 border border-border rounded-lg bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-base text-foreground placeholder:text-muted-foreground resize-y"
                        />
                      </div>

                      <Checkbox
                        id="custom_field_only_create"
                        checked={formData.custom_field_only}
                        onChange={(checked) => setFormData({ ...formData, custom_field_only: checked })}
                        label="Only process additional analysis (skip standard extraction)"
                      />

                    </div>

                    {/* Right column — output fields */}
                    <div className="w-72 shrink-0">
                      <label className="block text-base font-medium text-muted-foreground mb-4">
                        Output Fields
                      </label>
                      <div className="space-y-3.5">
                        {Object.entries(formData.output_fields || {}).map(([key, value]) => (
                          <Checkbox
                            key={key}
                            checked={value}
                            onChange={(checked) =>
                              setFormData({
                                ...formData,
                                output_fields: { ...formData.output_fields, [key]: checked },
                              })
                            }
                            label={key.replace(/_/g, ' ')}
                            className="capitalize"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer buttons — full width, Cancel left, Submit right */}
                  <div className="flex items-center justify-between pt-6">
                    <button
                      type="button"
                      onClick={() => setView('list')}
                      className="px-6 py-3 text-base font-medium border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePreset}
                      disabled={saving || !formData.name || !formData.role || (formData.custom_field_only && !formData.user_input)}
                      className="px-8 py-3 text-base font-medium bg-[#4a7c59] text-white rounded-lg hover:bg-[#3d6a4b] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? 'Saving...' : 'Submit'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </AnimatedModal>
  );
}
