import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Camera, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function PhotoDiff() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedEq, setSelectedEq] = useState(null);
  const [beforeUrl, setBeforeUrl] = useState('');
  const [afterUrl, setAfterUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [running, setRunning] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const [eq, photos] = await Promise.all([
        secureEntity('Equipment').list('-created_date', 100),
        secureEntity('AssetPhoto').list('-captured_date', 200),
      ]);
      setEquipmentList(eq);
      setPhotos(photos);
    })();
  }, []);

  const eqPhotos = selectedEq ? photos.filter((p) => p.equipment_id === selectedEq.id) : [];

  const upload = async (file, setter) => {
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setter(file_url);
  };

  const analyze = async () => {
    if (!beforeUrl || !afterUrl) return;
    setRunning(true);
    setAnalysis(null);
    try {
      const res = await base44.functions.invoke('photoDiffAnalyze', {
        equipment_id: selectedEq?.id,
        before_url: beforeUrl,
        after_url: afterUrl,
      });
      setAnalysis(res.data?.analysis);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRunning(false);
    }
  };

  const filtered = equipmentList.filter((e) =>
    !search || e.name?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20);

  return (
    <div className="p-4 md:p-6 max-w-[1480px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Camera className="w-7 h-7 text-fuchsia-600" /> Photo-Diff Inspector
        </h1>
        <p className="text-sm text-slate-500 mt-1">Side-by-side photo comparison with AI change detection.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-4">
          <h3 className="font-bold text-slate-900 mb-2 text-sm">1. Pick Asset</h3>
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-2" />
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {filtered.map((eq) => (
              <button key={eq.id} onClick={() => setSelectedEq(eq)}
                className={`w-full text-left p-2 rounded text-sm ${selectedEq?.id === eq.id ? 'bg-fuchsia-50 border border-fuchsia-300' : 'hover:bg-slate-50'}`}>
                <div className="font-medium truncate">{eq.name}</div>
                <div className="text-xs text-slate-500 truncate">{eq.location}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-bold text-slate-900 mb-2 text-sm">2. Before</h3>
          {beforeUrl ? (
            <img src={beforeUrl} alt="before" className="w-full rounded-lg mb-2" />
          ) : (
            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 mb-2">No image</div>
          )}
          <input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0], setBeforeUrl)} className="text-xs mb-2" />
          {eqPhotos.length > 0 && (
            <div className="text-xs text-slate-500 mb-1">Or pick from history:</div>
          )}
          <div className="grid grid-cols-3 gap-1">
            {eqPhotos.slice(0, 6).map((p) => (
              <button key={p.id} onClick={() => setBeforeUrl(p.photo_url)}
                className={`aspect-square rounded overflow-hidden border-2 ${beforeUrl === p.photo_url ? 'border-fuchsia-500' : 'border-transparent'}`}>
                <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-bold text-slate-900 mb-2 text-sm">3. After</h3>
          {afterUrl ? (
            <img src={afterUrl} alt="after" className="w-full rounded-lg mb-2" />
          ) : (
            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 mb-2">No image</div>
          )}
          <input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0], setAfterUrl)} className="text-xs mb-2" />
        </Card>
      </div>

      <div className="mt-5 flex justify-center">
        <Button onClick={analyze} disabled={!beforeUrl || !afterUrl || running}
          className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 px-8 h-12">
          {running ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analysing…</> :
            <><Sparkles className="w-4 h-4 mr-2" />Analyse Differences</>}
        </Button>
      </div>

      {analysis && (
        <Card className="p-5 mt-5">
          <div className="flex items-center gap-3 mb-3">
            <Badge className={
              analysis.condition_change === 'major_degradation' || analysis.condition_change === 'failure' ? 'bg-red-100 text-red-700' :
              analysis.condition_change === 'minor_degradation' ? 'bg-amber-100 text-amber-700' :
              analysis.condition_change === 'improved' ? 'bg-emerald-100 text-emerald-700' :
              'bg-slate-100 text-slate-700'
            }>
              {analysis.condition_change?.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-slate-500">Confidence: {analysis.confidence}%</span>
            {analysis.suggested_grade_change && (
              <Badge variant="outline" className="text-xs">Suggested grade: C{analysis.suggested_grade_change}</Badge>
            )}
          </div>
          <p className="text-sm text-slate-700 mb-4">{analysis.summary}</p>
          {analysis.changes?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-slate-700 uppercase mb-2">Changes detected</h4>
              <div className="space-y-2">
                {analysis.changes.map((c, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded text-sm flex items-start gap-2">
                    <Badge variant="outline" className="text-[10px]">{c.severity}</Badge>
                    <div>
                      <div className="font-medium text-slate-900">{c.area}</div>
                      <div className="text-xs text-slate-600">{c.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {analysis.recommended_action && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600 mt-0.5" />
              <div><strong>Recommended:</strong> {analysis.recommended_action}</div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}