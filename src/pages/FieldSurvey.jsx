import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Smartphone, MapPin, Camera, CheckCircle2, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getReferencePhoto } from '@/lib/photoLibrary';

export default function FieldSurvey() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [grade, setGrade] = useState(null);
  const [defectNote, setDefectNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const all = [];
      let page = 0;
      while (true) {
        const batch = await base44.entities.Equipment.list('-created_date', 200, page * 200);
        all.push(...batch);
        if (batch.length < 200) break;
        page++;
        if (page > 20) break;
      }
      setEquipment(all);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return equipment.slice(0, 50);
    const q = search.toLowerCase();
    return equipment.filter((e) =>
      e.name?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q) ||
      e.room?.toLowerCase().includes(q) ||
      e.specifications?.room_location?.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [equipment, search]);

  const handlePhoto = async (file) => {
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPhotoUrl(file_url);
  };

  const submit = async () => {
    if (!selected || grade == null) return;
    setSubmitting(true);
    try {
      await base44.functions.invoke('bulkUpdateConditions', {
        equipment_ids: [selected.id],
        updates: {
          condition_grade: grade,
          defect_description: defectNote || undefined,
          defect_urgency: grade >= 4 ? 'High' : grade === 3 ? 'Medium' : undefined,
        },
      });
      if (photoUrl) {
        await base44.entities.AssetPhoto.create({
          equipment_id: selected.id,
          equipment_name: selected.name,
          photo_url: photoUrl,
          captured_date: new Date().toISOString().slice(0, 10),
          condition_grade_at_capture: grade,
          notes: defectNote,
          photo_type: 'inspection',
        });
      }
      toast.success(`${selected.name} updated to C${grade}`);
      setSelected(null); setGrade(null); setDefectNote(''); setPhotoUrl('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="p-4 md:p-6 max-w-[800px] mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-indigo-600" /> Field Survey
        </h1>
        <p className="text-sm text-slate-500 mt-1">Inspector mobile flow — find asset, grade, photo, defect.</p>
      </div>

      {!selected && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-slate-400" />
            <Input placeholder="Search asset, location, room…" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.map((eq) => (
              <button key={eq.id} onClick={() => setSelected(eq)}
                className="w-full text-left p-3 rounded-lg border hover:bg-indigo-50 hover:border-indigo-300">
                <div className="font-semibold text-slate-900 text-sm">{eq.name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{eq.location} · {eq.room || eq.specifications?.room_location || '—'}</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {selected && (
        <Card className="p-5">
          <div className="flex items-start gap-3 mb-4 pb-4 border-b">
            <img src={getReferencePhoto(selected.specifications?.component_type)} alt="reference" className="w-20 h-20 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="font-bold text-slate-900">{selected.name}</div>
              <div className="text-xs text-slate-500">{selected.location} · {selected.room || selected.specifications?.room_location || '—'}</div>
              <div className="text-xs text-slate-400 mt-1">Current: C{selected.specifications?.condition_grade ?? '?'}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Cancel</Button>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-700 uppercase mb-2 block">Condition Grade</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { g: 1, label: 'Excellent', color: 'bg-emerald-500' },
                { g: 2, label: 'Good', color: 'bg-green-500' },
                { g: 3, label: 'Fair', color: 'bg-amber-500' },
                { g: 4, label: 'Poor', color: 'bg-orange-500' },
                { g: 5, label: 'Failed', color: 'bg-red-600' },
              ].map(({ g, label, color }) => (
                <button key={g} onClick={() => setGrade(g)}
                  className={`p-3 rounded-lg text-white font-bold text-sm ${color} ${grade === g ? 'ring-4 ring-indigo-500' : 'opacity-70'}`}>
                  <div className="text-2xl">C{g}</div>
                  <div className="text-[10px] mt-1">{label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-700 uppercase mb-2 block">Photo</label>
            <input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhoto(e.target.files?.[0])}
              className="text-sm" />
            {photoUrl && <img src={photoUrl} alt="captured" className="mt-2 w-full max-w-xs rounded-lg" />}
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-700 uppercase mb-2 block">Defect Notes (optional)</label>
            <Textarea value={defectNote} onChange={(e) => setDefectNote(e.target.value)} placeholder="What did you observe?" rows={3} />
          </div>

          <Button onClick={submit} disabled={!grade || submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</> :
              <><CheckCircle2 className="w-4 h-4 mr-2" />Save Inspection</>}
          </Button>
        </Card>
      )}
    </div>
  );
}