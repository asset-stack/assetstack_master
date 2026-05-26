import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPinned, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RoomTaggingPanel({ scan, frames = [], onUpdated }) {
  const [assessmentId, setAssessmentId] = useState('');
  const [savingFrameId, setSavingFrameId] = useState('');
  const [suggesting, setSuggesting] = useState(false);

  const { data: assessments = [] } = useQuery({
    queryKey: ['conditionAssessmentsForRoomTagging'],
    queryFn: () => secureEntity('ConditionAssessment').list('-assessment_date', 25),
  });

  const selectedAssessmentId = assessmentId || assessments.find((a) =>
    scan?.location_id && a.location_id === scan.location_id
  )?.id || assessments[0]?.id || '';

  const { data: rooms = [] } = useQuery({
    queryKey: ['assessmentRoomsForRoomTagging', selectedAssessmentId],
    queryFn: async () => {
      if (!selectedAssessmentId) return [];
      return secureEntity('AssessmentRoom').filter({ assessment_id: selectedAssessmentId }, 'display_order', 200);
    },
    enabled: !!selectedAssessmentId,
  });

  const taggedCount = frames.filter((f) => f.room_code || f.room_name).length;
  const roomOptions = useMemo(() => rooms.map((r) => ({
    value: r.id,
    label: `${r.room_code || 'Room'} — ${r.name}`,
    room: r,
  })), [rooms]);

  const findRoomValue = (frame) => {
    const match = rooms.find((r) => r.room_code === frame.room_code || r.name === frame.room_name);
    return match?.id || '';
  };

  const tagFrame = async (frame, roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    setSavingFrameId(frame.id);
    await base44.entities.ScanFrame.update(frame.id, {
      room_code: room.room_code,
      room_name: room.name,
      source_sheet: frame.source_sheet || 'Room tagging',
    });
    setSavingFrameId('');
    onUpdated && onUpdated();
  };

  const suggestTags = async () => {
    if (!scan?.id || !selectedAssessmentId) return;
    setSuggesting(true);
    const res = await base44.functions.invoke('suggestScanFrameRoomTags', {
      digital_twin_model_id: scan.id,
      assessment_id: selectedAssessmentId,
      limit: 20,
    });
    toast?.success?.(`Tagged ${res?.data?.updated_count || 0} frame(s)`);
    setSuggesting(false);
    onUpdated && onUpdated();
  };

  if (!scan || !frames.length) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPinned className="w-4 h-4 text-indigo-600" /> Room tagging workspace
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Link each JPEG frame to the Excel room list so AI findings and reports are grouped by room.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-slate-50">{taggedCount}/{frames.length} tagged</Badge>
          <Select value={selectedAssessmentId} onValueChange={setAssessmentId}>
            <SelectTrigger className="w-[260px] h-9 text-xs">
              <SelectValue placeholder="Select assessment" />
            </SelectTrigger>
            <SelectContent>
              {assessments.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={suggestTags} disabled={suggesting || !rooms.length} className="bg-indigo-600 hover:bg-indigo-700">
            {suggesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            AI suggest tags
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
        {frames.map((frame) => (
          <div key={frame.id} className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
            <img src={frame.image_url} alt={frame.angle_label} className="w-full aspect-[4/3] object-cover bg-slate-100" />
            <div className="p-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-semibold text-slate-700 truncate">{frame.angle_label}</div>
                {(frame.room_code || frame.room_name) && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> {frame.room_code || 'Tagged'}
                  </Badge>
                )}
              </div>
              <Select value={findRoomValue(frame)} onValueChange={(roomId) => tagFrame(frame, roomId)} disabled={savingFrameId === frame.id || !rooms.length}>
                <SelectTrigger className="h-8 text-xs bg-white">
                  <SelectValue placeholder={frame.room_name || 'Choose Excel room'} />
                </SelectTrigger>
                <SelectContent>
                  {roomOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}