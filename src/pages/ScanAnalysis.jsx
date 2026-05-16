import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Upload, Sparkles, Loader2, Box, Brain, Filter, CheckCircle2, ImagePlus } from 'lucide-react';
import { motion } from 'framer-motion';

import ScanViewer3D from '@/components/scan-analysis/ScanViewer3D';
import ScanCard from '@/components/scan-analysis/ScanCard';
import ScanUploadDialog from '@/components/scan-analysis/ScanUploadDialog';
import AnomalyReviewCard from '@/components/scan-analysis/AnomalyReviewCard';
import MLTrainingPanel from '@/components/scan-analysis/MLTrainingPanel';
import DeskConditionDemo from '@/components/scan-analysis/DeskConditionDemo';
import QuickAnalyzeImage from '@/components/scan-analysis/QuickAnalyzeImage';
import OBJFrameCapture from '@/components/scan-analysis/OBJFrameCapture';

import ScanFramesGallery from '@/components/scan-analysis/ScanFramesGallery';
import HowItWorks from '@/components/scan-analysis/HowItWorks';
import RealPhotoWorkflowGuide from '@/components/scan-analysis/RealPhotoWorkflowGuide';
import AddPhotoFrames from '@/components/scan-analysis/AddPhotoFrames';
import ScanProgressStrip from '@/components/scan-analysis/ScanProgressStrip';
import PendingReviewSLA from '@/components/scan-analysis/PendingReviewSLA';
import BulkVerifyBar from '@/components/scan-analysis/BulkVerifyBar';
import SmartTriageQueue from '@/components/scan-analysis/SmartTriageQueue';
import KeyboardReviewMode from '@/components/scan-analysis/KeyboardReviewMode';
import ConfidenceAutoApprove from '@/components/scan-analysis/ConfidenceAutoApprove';
import SeverityHeatmapOverlay from '@/components/scan-analysis/SeverityHeatmapOverlay';
import ConditionTrendCompare from '@/components/scan-analysis/ConditionTrendCompare';
import ConditionReportExport from '@/components/scan-analysis/ConditionReportExport';
import KeyboardShortcutsHelp from '@/components/scan-analysis/KeyboardShortcutsHelp';
import { toast } from 'sonner';

export default function ScanAnalysisPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [quickAnalyzeOpen, setQuickAnalyzeOpen] = useState(false);
  const [selectedScanId, setSelectedScanId] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(null); // { current, total } | null
  const [filter, setFilter] = useState('pending');
  const [selectedFrameId, setSelectedFrameId] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const qc = useQueryClient();

  const { data: scans = [], isLoading } = useQuery({
    queryKey: ['digitalTwinScans'],
    queryFn: () => base44.entities.DigitalTwinModel.list('-created_date', 50),
  });

  const selectedScan = useMemo(
    () => scans.find((s) => s.id === selectedScanId) || scans[0],
    [scans, selectedScanId]
  );

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipmentList'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 50),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['conditionReports', selectedScan?.id],
    queryFn: async () => {
      if (!selectedScan?.id) return [];
      return base44.entities.ConditionReport.filter({ digital_twin_model_id: selectedScan.id }, '-created_date', 100);
    },
    enabled: !!selectedScan?.id,
  });

  const { data: frames = [] } = useQuery({
    queryKey: ['scanFrames', selectedScan?.id],
    queryFn: async () => {
      if (!selectedScan?.id) return [];
      return base44.entities.ScanFrame.filter({ digital_twin_model_id: selectedScan.id }, 'frame_index', 50);
    },
    enabled: !!selectedScan?.id,
    refetchInterval: extracting ? 2000 : false,
  });

  const selectedFrame = useMemo(
    () => frames.find((f) => f.id === selectedFrameId) || frames[0],
    [frames, selectedFrameId]
  );

  // Auto-trigger frame extraction only for uploaded 3D model files.
  // Real-photo scans use the uploaded image directly for condition reports.
  const hasModelFile = !!(selectedScan?.file_url && ['obj', 'gltf', 'glb'].includes(selectedScan.model_type));
  const needsExtraction = !!(selectedScan && frames.length === 0 && hasModelFile);

  // Kick off extraction state when conditions are met
  useEffect(() => {
    if (needsExtraction && !extracting) setExtracting(true);
  }, [needsExtraction, extracting, selectedScan?.id]);

  const filteredReports = useMemo(() => {
    if (filter === 'all') return reports;
    return reports.filter((r) => r.review_status === filter);
  }, [reports, filter]);

  // Build overlays from equipment (demo positioning) + any stored overlays
  const overlays = useMemo(() => {
    if (selectedScan?.asset_overlays?.length) return selectedScan.asset_overlays;
    // Demo: distribute first 5 equipment items around the scene
    return equipment.slice(0, 5).map((eq, i) => {
      const angle = (i / 5) * Math.PI * 2;
      return {
        equipment_id: eq.id,
        equipment_name: eq.name,
        condition: eq.status === 'critical' ? 'critical' : eq.status === 'degraded' ? 'degraded' : 'operational',
        x: Math.cos(angle) * 4,
        y: 0.5,
        z: Math.sin(angle) * 4,
      };
    });
  }, [equipment, selectedScan]);

  const runAIAnalysis = async () => {
    if (!selectedScan || !selectedScan.preview_image_url) {
      toast?.error?.('This scan needs a preview image to analyze. Please upload one.');
      return;
    }
    setAnalyzing(true);

    // Build list of images to analyze: main preview + pending frames
    const pendingFrames = frames.filter((f) => f.analysis_status !== 'completed' && f.image_url);
    const totalImages = 1 + pendingFrames.length;
    setAnalysisProgress({ current: 0, total: totalImages });

    let totalFindings = 0;
    let totalDupes = 0;
    let firstError = null;
    let completed = 0;

    try {
      // Main preview first (sequential to keep the lock contention low)
      const mainRes = await base44.functions.invoke('analyzeScanCondition', {
        image_url: selectedScan.preview_image_url,
        digital_twin_model_id: selectedScan.id,
        digital_twin_model_name: selectedScan.name,
        replace_previous: true,
      });
      totalFindings += mainRes?.data?.findings_count || 0;
      totalDupes += mainRes?.data?.duplicates_skipped || 0;
      completed++;
      setAnalysisProgress({ current: completed, total: totalImages });

      // Frames: throttle in batches of 3 to avoid rate limits but stay fast
      const batchSize = 3;
      for (let i = 0; i < pendingFrames.length; i += batchSize) {
        const batch = pendingFrames.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map((frame) =>
            base44.functions.invoke('analyzeScanCondition', {
              image_url: frame.image_url,
              digital_twin_model_id: selectedScan.id,
              digital_twin_model_name: `${selectedScan.name} — ${frame.angle_label}`,
              frame_id: frame.id,
            })
          )
        );
        for (const r of results) {
          completed++;
          if (r.status === 'fulfilled') {
            totalFindings += r.value?.data?.findings_count || 0;
            totalDupes += r.value?.data?.duplicates_skipped || 0;
          } else if (!firstError) {
            firstError = r.reason?.message || 'A frame failed to analyze';
          }
        }
        setAnalysisProgress({ current: completed, total: totalImages });
      }

      if (firstError && totalFindings === 0) {
        toast?.error?.(`Analysis incomplete: ${firstError}`);
      } else {
        toast?.success?.(
          `Analysis complete: ${totalFindings} new finding(s)` +
          (totalDupes ? ` (${totalDupes} duplicate(s) skipped)` : '') +
          (firstError ? ' — some frames failed' : '')
        );
      }
    } catch (err) {
      toast?.error?.(`Analysis failed: ${err?.message || 'Unknown error'}`);
      console.error('runAIAnalysis error:', err);
    } finally {
      setAnalyzing(false);
      setAnalysisProgress(null);
      qc.invalidateQueries({ queryKey: ['conditionReports', selectedScan.id] });
      qc.invalidateQueries({ queryKey: ['scanFrames', selectedScan.id] });
      qc.invalidateQueries({ queryKey: ['digitalTwinScans'] });
    }
  };

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((r) => r.review_status === 'pending').length,
    approved: reports.filter((r) => r.review_status === 'approved').length,
    rejected: reports.filter((r) => r.review_status === 'rejected').length,
    corrected: reports.filter((r) => r.review_status === 'corrected').length,
  }), [reports]);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Box className="w-7 h-7 text-indigo-600" />
            Scan Analysis
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload 3D scans, overlay your asset register, and let AI detect condition anomalies that improve over time.
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <KeyboardShortcutsHelp />
          {selectedScan && <ConditionReportExport scan={selectedScan} reports={reports} />}
          <Button
            onClick={() => setQuickAnalyzeOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <ImagePlus className="w-4 h-4 mr-2" /> Analyze Image
          </Button>
          <Button onClick={() => setUploadOpen(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" /> Upload 3D Scan
          </Button>
        </div>
      </div>

      <PendingReviewSLA />

      <RealPhotoWorkflowGuide />

      {/* How it works */}
      <HowItWorks />

      {/* Scans gallery */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Scans ({scans.length})</h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
        ) : scans.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">
            <Box className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No scans yet</p>
            <p className="text-sm text-slate-400 mb-4">Upload your first 3D scan to get started.</p>
            <Button onClick={() => setUploadOpen(true)}><Upload className="w-4 h-4 mr-2" /> Upload Scan</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {scans.map((s) => (
              <ScanCard
                key={s.id}
                scan={s}
                selected={selectedScan?.id === s.id}
                onClick={() => setSelectedScanId(s.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedScan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: 3D viewer */}
          <div className="lg:col-span-2 space-y-4">
            <ScanProgressStrip scan={selectedScan} frames={frames} reports={reports} />

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <div>
                  <h3 className="font-bold text-slate-900">{selectedScan.name}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedScan.model_type?.toUpperCase()} • {overlays.length} assets overlaid • {stats.total} anomalies detected
                  </p>
                </div>
                <div className="flex gap-2">
                  <AddPhotoFrames
                    scan={selectedScan}
                    existingFramesCount={frames.length}
                    onAdded={() => {
                      qc.invalidateQueries({ queryKey: ['scanFrames', selectedScan.id] });
                      qc.invalidateQueries({ queryKey: ['conditionReports', selectedScan.id] });
                    }}
                  />
                  <Button
                    onClick={runAIAnalysis}
                    disabled={analyzing || !selectedScan.preview_image_url}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {analysisProgress
                          ? `Analyzing ${analysisProgress.current}/${analysisProgress.total}…`
                          : 'Analyzing…'}
                      </>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Re-run AI</>
                    )}
                  </Button>
                </div>
              </div>
              <div className="h-[500px]">
                <ScanViewer3D
                  modelUrl={selectedScan.file_url}
                  modelType={selectedScan.model_type}
                  overlays={overlays}
                />
              </div>
            </div>

            {/* Analyzed Image — Desk condition demo when no preview available */}
            {!selectedScan.preview_image_url && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Analyzed Asset — Condition Detail
                </h4>
                <div className="h-[420px]">
                  <DeskConditionDemo />
                </div>
              </div>
            )}

            {/* Frame extraction banner */}
            {(needsExtraction || extracting) && (
              hasModelFile ? (
                <OBJFrameCapture
                  scan={selectedScan}
                  onComplete={() => {
                    setExtracting(false);
                    qc.invalidateQueries({ queryKey: ['scanFrames', selectedScan.id] });
                    qc.invalidateQueries({ queryKey: ['conditionReports', selectedScan.id] });
                    qc.invalidateQueries({ queryKey: ['digitalTwinScans'] });
                  }}
                />
              ) : null
            )}

            {/* Frames gallery */}
            {frames.length > 0 && (
              <ScanFramesGallery
                frames={frames}
                selectedFrameId={selectedFrame?.id}
                onSelect={(f) => setSelectedFrameId(f.id)}
              />
            )}

            {/* Before/after comparison with previous scan of same location */}
            <ConditionTrendCompare currentScan={selectedScan} />

            {/* Preview image with bboxes — uses selected frame if available, else scan preview */}
            {(selectedFrame?.image_url || selectedScan.preview_image_url) && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Analyzed Image {selectedFrame ? `— ${selectedFrame.angle_label}` : ''}
                </h4>
                <div className="relative rounded-lg overflow-hidden bg-slate-100">
                  <SeverityHeatmapOverlay
                    reports={reports}
                    imageUrl={selectedFrame?.image_url || selectedScan.preview_image_url}
                  />
                  <img
                    src={selectedFrame?.image_url || selectedScan.preview_image_url}
                    alt="Scan preview"
                    className="w-full"
                  />
                  {reports
                    .filter((r) => r.bounding_box && r.image_url === (selectedFrame?.image_url || selectedScan.preview_image_url))
                    .map((r) => (
                    <div
                      key={r.id}
                      className={`absolute border-2 rounded ${
                        r.review_status === 'approved' ? 'border-green-500 bg-green-500/10' :
                        r.review_status === 'rejected' ? 'border-slate-400 bg-slate-400/10 opacity-50' :
                        r.review_status === 'corrected' ? 'border-amber-500 bg-amber-500/10' :
                        'border-red-500 bg-red-500/10 animate-pulse'
                      }`}
                      style={{
                        left: `${(r.bounding_box.x || 0) * 100}%`,
                        top: `${(r.bounding_box.y || 0) * 100}%`,
                        width: `${(r.bounding_box.width || 0) * 100}%`,
                        height: `${(r.bounding_box.height || 0) * 100}%`,
                      }}
                    >
                      <div className={`absolute -top-5 left-0 text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap text-white ${
                        r.review_status === 'approved' ? 'bg-green-500' :
                        r.review_status === 'rejected' ? 'bg-slate-400' :
                        r.review_status === 'corrected' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}>
                        {r.anomaly_type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: ML + Review */}
          <div className="space-y-4">
            <MLTrainingPanel />

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-600" /> Verify Condition Reports
                </h3>
                <Badge variant="outline">{stats.total}</Badge>
              </div>
              <div className="mb-3 rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-800">
                Review each highlighted asset photo, then click <span className="font-bold">Verify</span>, <span className="font-bold">Fix AI</span>, or <span className="font-bold">Not issue</span>.
              </div>

              <div className="grid grid-cols-4 gap-1 mb-3 text-center text-[10px]">
                <div className="bg-amber-50 rounded p-1.5">
                  <div className="font-bold text-amber-700">{stats.pending}</div>
                  <div className="text-amber-600">Pending</div>
                </div>
                <div className="bg-green-50 rounded p-1.5">
                  <div className="font-bold text-green-700">{stats.approved}</div>
                  <div className="text-green-600">Approved</div>
                </div>
                <div className="bg-orange-50 rounded p-1.5">
                  <div className="font-bold text-orange-700">{stats.corrected}</div>
                  <div className="text-orange-600">Corrected</div>
                </div>
                <div className="bg-slate-50 rounded p-1.5">
                  <div className="font-bold text-slate-700">{stats.rejected}</div>
                  <div className="text-slate-600">Rejected</div>
                </div>
              </div>

              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="grid grid-cols-4 w-full h-8">
                  <TabsTrigger value="pending" className="text-[11px]">Pending</TabsTrigger>
                  <TabsTrigger value="approved" className="text-[11px]">Approved</TabsTrigger>
                  <TabsTrigger value="corrected" className="text-[11px]">Corrected</TabsTrigger>
                  <TabsTrigger value="all" className="text-[11px]">All</TabsTrigger>
                </TabsList>
              </Tabs>

              {filter === 'pending' && (
                <div className="mt-3">
                  <ConfidenceAutoApprove
                    reports={reports}
                    onDone={() => {
                      qc.invalidateQueries({ queryKey: ['conditionReports', selectedScan.id] });
                      qc.invalidateQueries({ queryKey: ['pendingTrainingSamples'] });
                    }}
                  />
                  <SmartTriageQueue
                    reports={reports}
                    onOpenKeyboardMode={() => setKeyboardMode(true)}
                    onDone={() => {
                      qc.invalidateQueries({ queryKey: ['conditionReports', selectedScan.id] });
                      qc.invalidateQueries({ queryKey: ['pendingTrainingSamples'] });
                      qc.invalidateQueries({ queryKey: ['workOrders'] });
                    }}
                  />
                  <BulkVerifyBar
                    reports={reports}
                    onDone={() => {
                      qc.invalidateQueries({ queryKey: ['conditionReports', selectedScan.id] });
                      qc.invalidateQueries({ queryKey: ['pendingTrainingSamples'] });
                    }}
                  />
                </div>
              )}

              <div className="mt-3 space-y-3 max-h-[800px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    {reports.length === 0 ? (
                      <>
                        <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p>No anomalies yet.</p>
                        <p className="text-xs">Click "Run AI Analysis" to detect issues.</p>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p>Nothing in this filter.</p>
                      </>
                    )}
                  </div>
                ) : (
                  filteredReports.map((r) => (
                    <AnomalyReviewCard
                      key={r.id}
                      report={r}
                      onReviewed={() => {
                        qc.invalidateQueries({ queryKey: ['conditionReports', selectedScan.id] });
                        qc.invalidateQueries({ queryKey: ['pendingTrainingSamples'] });
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ScanUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onCreated={() => qc.invalidateQueries({ queryKey: ['digitalTwinScans'] })}
      />

      <QuickAnalyzeImage
        open={quickAnalyzeOpen}
        onClose={() => setQuickAnalyzeOpen(false)}
        onCompleted={(newScanId) => {
          qc.invalidateQueries({ queryKey: ['digitalTwinScans'] });
          qc.invalidateQueries({ queryKey: ['conditionReports', newScanId] });
          setSelectedScanId(newScanId);
        }}
      />

      <KeyboardReviewMode
        open={keyboardMode}
        onClose={() => setKeyboardMode(false)}
        reports={reports}
        onChanged={() => {
          qc.invalidateQueries({ queryKey: ['conditionReports', selectedScan?.id] });
          qc.invalidateQueries({ queryKey: ['workOrders'] });
        }}
      />
    </div>
  );
}