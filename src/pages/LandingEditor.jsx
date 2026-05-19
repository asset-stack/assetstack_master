import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Save, Eye, EyeOff, RotateCcw, Loader2, Layout, ExternalLink, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { SECTION_REGISTRY, DEFAULT_SECTION_ORDER, resolveSections } from '@/components/landing/sectionRegistry';

export default function LandingEditor() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [sections, setSections] = useState([]);
  const [savedLayoutId, setSavedLayoutId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalSnapshot, setOriginalSnapshot] = useState('[]');

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch (_) {
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const rows = await base44.entities.LandingLayout.filter({ is_active: true }, '-updated_date', 1);
        const saved = rows?.[0];
        const resolved = resolveSections(saved?.sections);
        setSections(resolved);
        setOriginalSnapshot(JSON.stringify(resolved));
        if (saved?.id) setSavedLayoutId(saved.id);
      } catch (e) {
        toast?.error?.(`Could not load layout: ${e.message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const isDirty = useMemo(
    () => JSON.stringify(sections) !== originalSnapshot,
    [sections, originalSnapshot]
  );

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    const next = Array.from(sections);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    setSections(next);
  };

  const toggleVisible = (key) => {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s)));
  };

  const resetToDefaults = () => {
    setSections(DEFAULT_SECTION_ORDER.map((key) => ({ key, visible: true })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        is_active: true,
        sections: sections.map((s) => ({ key: s.key, visible: s.visible !== false })),
        last_edited_by: user?.email || '',
      };
      if (savedLayoutId) {
        await base44.entities.LandingLayout.update(savedLayoutId, payload);
      } else {
        const created = await base44.entities.LandingLayout.create(payload);
        setSavedLayoutId(created.id);
      }
      setOriginalSnapshot(JSON.stringify(sections));
      toast?.success?.('Landing layout saved');
    } catch (e) {
      toast?.error?.(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Auth guard
  if (!authReady || loading) {
    return (
      <div className="p-10 flex items-center gap-2 text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-10 max-w-md mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h2 className="font-bold text-slate-900 mb-1">Admin access required</h2>
          <p className="text-sm text-slate-600">Only admins can edit the landing page layout.</p>
        </div>
      </div>
    );
  }

  const visibleCount = sections.filter((s) => s.visible).length;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Layout className="w-7 h-7 text-indigo-600" />
            Landing Page Editor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Drag sections to reorder them. Toggle visibility to hide a section without deleting it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/Landing" target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" /> Preview
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={resetToDefaults} disabled={saving}>
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : <><Save className="w-4 h-4 mr-2" /> Save layout</>}
          </Button>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-4 text-xs text-indigo-800 flex items-center justify-between gap-2 flex-wrap">
        <span>{visibleCount} of {sections.length} sections visible on the live page.</span>
        {isDirty && <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">Unsaved changes</Badge>}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {sections.map((s, index) => {
                const entry = SECTION_REGISTRY[s.key];
                if (!entry) return null;
                return (
                  <Draggable key={s.key} draggableId={s.key} index={index}>
                    {(prov, snapshot) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className={`bg-white border rounded-lg flex items-center gap-3 p-3 transition-shadow ${
                          snapshot.isDragging ? 'shadow-lg border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'
                        } ${!s.visible ? 'opacity-60' : ''}`}
                      >
                        <div
                          {...prov.dragHandleProps}
                          className="text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing p-1"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="w-6 text-center text-xs font-semibold text-slate-400 tabular-nums">{index + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-slate-900 truncate">{entry.label}</div>
                          <div className="text-xs text-slate-500 truncate">{entry.description}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {s.visible ? (
                            <Eye className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-slate-400" />
                          )}
                          <Switch checked={s.visible} onCheckedChange={() => toggleVisible(s.key)} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}