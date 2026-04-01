'use client';

import { useState, useEffect } from 'react';
import { X, User, Settings, Plus, Edit2, Trash2, Star, Copy, Lock, AlertCircle, Loader2, ArrowLeft, Save } from 'lucide-react';
import { useConfig } from '@/lib/config-context';
import { presetsAPI, authAPI } from '@/lib/api';
import { useToast } from './Toast';

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
        className={`group relative rounded-xl border transition-all duration-200 p-5 hover:-translate-y-1 ${isActive
          ? 'bg-primary/5 border-primary ring-2 ring-primary ring-offset-2 shadow-lg'
          : preset.is_system
            ? 'bg-card border-border hover:border-primary/20 hover:shadow-lg'
            : 'bg-card border-primary/10 hover:border-primary/30 hover:shadow-lg'
          }`}
      >
        {preset.is_default && (
          <div className="absolute top-3 right-3">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-sm" />
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-foreground">{preset.name}</h3>
            {preset.is_system && (
              <span className="px-2 py-0.5 bg-muted text-muted-foreground border border-border text-[10px] font-bold uppercase tracking-wider rounded-full">
                System
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            <span>{preset.config.role}</span>
          </div>

          {(preset.config.user_input || preset.config.custom_field_only) && (
            <div className="mt-3 space-y-1">
              {preset.config.user_input && (
                <p className="text-xs text-muted-foreground line-clamp-2 bg-muted p-2 rounded border border-border">
                  "{preset.config.user_input}"
                </p>
              )}
              {preset.config.custom_field_only && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded w-fit">
                  <AlertCircle className="w-3 h-3" />
                  Custom Analysis Only
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border">
          <button
            onClick={() => handleSelectPreset(preset)}
            disabled={isActive || saving}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${isActive
              ? 'bg-primary text-primary-foreground cursor-default'
              : saving
                ? 'bg-primary/70 text-primary-foreground cursor-wait'
                : 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover hover:shadow'
              }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : isActive ? (
              'Applied'
            ) : (
              'Apply'
            )}
          </button>

          {/* Edit/Customize Button */}
          <button
            onClick={() => handleEdit(preset)}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/10"
            title={preset.is_system ? "Customize this template" : "Edit preset"}
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* User Preset Actions */}
          {!preset.is_system && (
            <>
              {!preset.is_default && (
                <button
                  onClick={() => handleSetDefault(preset)}
                  className="p-2 text-muted-foreground hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                  title="Set as default"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(preset)}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Delete preset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            {view === 'edit' && (
              <button
                onClick={() => setView('list')}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors mr-1"
                title="Back to list"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="p-2 bg-primary/5 rounded-lg">
              {view === 'edit'
                ? <Settings className="w-6 h-6 text-primary" />
                : <User className="w-6 h-6 text-primary" />
              }
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {view === 'list' ? 'Manage Presets' : (editingPreset ? 'Edit Preset' : (isSystemTemplate ? 'Customize Template' : 'New Preset'))}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {view === 'edit' && (
              <button
                onClick={handleSavePreset}
                disabled={saving || !formData.name || !formData.role || (formData.custom_field_only && !formData.user_input)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">

          {view === 'list' ? (
            <div className="space-y-8">
              {/* User Presets Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    My Presets
                    <span className="px-2 py-0.5 bg-primary/5 text-primary text-xs rounded-full font-medium">
                      {userPresets.length}
                    </span>
                  </h3>
                  <button
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover text-sm font-medium flex items-center gap-2 shadow-sm transition-all hover:shadow"
                  >
                    <Plus className="w-4 h-4" />
                    Create New
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading...</div>
                ) : userPresets.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">No custom presets yet. Create one or use a system template below.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userPresets.map(renderPresetCard)}
                  </div>
                )}
              </div>

              {/* System Presets Section */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">System Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SYSTEM_PRESETS.map(renderPresetCard)}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Edit/Create Form */}
              {isSystemTemplate && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 text-sm text-blue-700">
                  You are customizing a system template. The Name and Role are fixed, but you can add a default analysis request and modify output fields.
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Preset Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., HR Manager, Sales Lead"
                      disabled={isSystemTemplate}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${isSystemTemplate ? 'bg-muted text-muted-foreground border-border cursor-not-allowed' : 'border-border'
                        }`}
                    />
                    {isSystemTemplate && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Role *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g., HR, Sales, Project Manager"
                      disabled={isSystemTemplate}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${isSystemTemplate ? 'bg-muted text-muted-foreground border-border cursor-not-allowed' : 'border-border'
                        }`}
                    />
                    {isSystemTemplate && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-foreground">
                      Default Analysis Request {formData.custom_field_only ? '(Required)' : '(Optional)'}
                    </label>
                    {formData.custom_field_only && !formData.user_input && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Required when "Only process additional analysis" is checked
                      </span>
                    )}
                  </div>
                  <textarea
                    value={formData.user_input}
                    onChange={(e) => setFormData({ ...formData, user_input: e.target.value })}
                    placeholder={formData.custom_field_only
                      ? "Enter the specific question or analysis instructions..."
                      : "Enter a default analysis request that will auto-fill when this preset is selected..."}
                    rows={3}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${formData.custom_field_only && !formData.user_input ? 'border-amber-300 bg-amber-50' : 'border-border'
                      }`}
                  />

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="custom_field_only"
                      checked={formData.custom_field_only}
                      onChange={(e) => setFormData({ ...formData, custom_field_only: e.target.checked })}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="custom_field_only" className="text-sm text-foreground">
                      Only process additional analysis (skip standard extraction)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Output Fields
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(formData.output_fields || {}).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              output_fields: {
                                ...formData.output_fields,
                                [key]: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-sm text-foreground capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>


              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
