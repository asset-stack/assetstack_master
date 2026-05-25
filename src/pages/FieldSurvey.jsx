import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Smartphone, Loader2, Search, ShieldCheck, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FieldSurveyRow from '@/components/field-survey/FieldSurveyRow';

export default function FieldSurvey() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | ungraded | poor | needs_review
  const [verifiedCount, setVerifiedCount] = useState(0);

  useEffect(() => {
    (async () => {
      const all = [];
      let page = 0;
      while (true) {
        const batch = await secureEntity('Equipment').list('-created_date', 200, page * 200);
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
    let list = equipment;
    if (filter === 'ungraded') list = list.filter((e) => e.specifications?.condition_grade == null);
    else if (filter === 'poor') list = list.filter((e) => e.specifications?.condition_grade >= 4);
    else if (filter === 'needs_review') list = list.filter((e) => {
      const g = e.specifications?.condition_grade;
      return g == null || g >= 3;
    });

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) =>
        e.name?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.room?.toLowerCase().includes(q) ||
        e.specifications?.room_location?.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 100);
  }, [equipment, search, filter]);

  const handleSubmit = async ({ asset, grade, note, photoUrl, verified_only }) => {
    try {
      await base44.functions.invoke('bulkUpdateConditions', {
        equipment_ids: [asset.id],
        updates: {
          condition_grade: grade,
          defect_description: note || undefined,
          defect_urgency: grade >= 4 ? 'High' : grade === 3 ? 'Medium' : undefined,
        },
      });
      if (photoUrl) {
        await secureEntity('AssetPhoto').create({
          equipment_id: asset.id,
          equipment_name: asset.name,
          photo_url: photoUrl,
          captured_date: new Date().toISOString().slice(0, 10),
          condition_grade_at_capture: grade,
          notes: note,
          photo_type: 'inspection',
        });
      }
      setVerifiedCount((c) => c + 1);
      toast.success(verified_only ? `${asset.name} verified` : `${asset.name} → C${grade}`);
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-indigo-600" /> Field Survey
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Walk the site. Each asset shows its current condition — tick to verify or fix inline.
        </p>
      </div>

      {/* Stats + filter bar */}
      <Card className="p-3 mb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {verifiedCount} verified this session
            </div>
            <div className="text-slate-400">·</div>
            <div className="text-slate-600">{filtered.length} showing</div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-8 text-xs w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assets</SelectItem>
                <SelectItem value="needs_review">Needs review (C3+ / ungraded)</SelectItem>
                <SelectItem value="ungraded">Never graded</SelectItem>
                <SelectItem value="poor">Poor / Failed (C4–C5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search asset, room, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* Inline list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-sm text-slate-500">
            No assets match — try a different filter.
          </Card>
        ) : (
          filtered.map((eq) => (
            <FieldSurveyRow key={eq.id} asset={eq} onSubmit={handleSubmit} />
          ))
        )}
        {equipment.length > filtered.length && filtered.length === 100 && (
          <div className="text-center text-xs text-slate-400 py-2">
            Showing first 100 — narrow the search to see more
          </div>
        )}
      </div>
    </div>
  );
}