import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Loads the full data set needed to render the 14-page report.
export function useReportData(assessmentId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!assessmentId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [assessment, rooms, components, defects, engineResp] = await Promise.all([
          base44.entities.ConditionAssessment.get(assessmentId),
          base44.entities.AssessmentRoom.filter({ assessment_id: assessmentId }, 'room_code', 500),
          base44.entities.AssessmentComponent.filter({ assessment_id: assessmentId }, 'room_code', 2000),
          base44.entities.AssessmentDefect.filter({ assessment_id: assessmentId }, 'defect_id', 1000),
          base44.functions.invoke('generateConditionAssessment', { assessment_id: assessmentId, persist: false }),
        ]);
        if (cancelled) return;
        setData({
          assessment,
          rooms: rooms || [],
          components: components || [],
          defects: defects || [],
          engine: engineResp?.data,
        });
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load report');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [assessmentId]);

  return { data, loading, error };
}