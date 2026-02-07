import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Circle, ChevronLeft, ChevronRight, Camera, 
  Cpu, MapPin, Clock, AlertTriangle, Save, Loader2, Check,
  ArrowLeft, User, Calendar, Upload, WifiOff, CloudOff,
  Plus, Trash2, Package, DollarSign, Image as ImageIcon
} from 'lucide-react';
import HapticButton from "@/components/mobile/HapticButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { offlineStore } from '@/components/mobile/OfflineSyncManager';

export default function MobileChecklist() {
  const urlParams = new URLSearchParams(window.location.search);
  const workOrderId = urlParams.get('id');
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [activeTab, setActiveTab] = useState('checklist');
  const [laborEntries, setLaborEntries] = useState([]);
  const [partsUsed, setPartsUsed] = useState([]);
  const [offlineMedia, setOfflineMedia] = useState([]);
  const [newLabor, setNewLabor] = useState({ technician: '', hours: '', description: '' });
  const [newPart, setNewPart] = useState({ part_name: '', quantity: 1 });
  const mediaInputRef = useRef(null);

  // Online/offline tracking
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Fetch work order — fall back to cache when offline
  const { data: workOrder, isLoading } = useQuery({
    queryKey: ['workOrder', workOrderId],
    queryFn: async () => {
      if (!navigator.onLine) {
        const cached = offlineStore.getWorkOrderWithPending(workOrderId);
        if (cached) return cached;
        throw new Error('Offline and no cache');
      }
      const orders = await base44.entities.WorkOrder.filter({ id: workOrderId });
      const wo = orders[0];
      if (wo) offlineStore.cacheWorkOrder(wo); // cache for offline
      return wo;
    },
    enabled: !!workOrderId,
    retry: false,
    initialData: () => offlineStore.getWorkOrderWithPending(workOrderId),
  });

  const { data: equipment } = useQuery({
    queryKey: ['equipment', workOrder?.equipment_id],
    queryFn: async () => {
      const items = await base44.entities.Equipment.filter({ id: workOrder.equipment_id });
      return items[0];
    },
    enabled: !!workOrder?.equipment_id && !isOffline
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => base44.entities.Technician.list('-created_date', 100),
    enabled: !isOffline,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    enabled: !isOffline,
  });

  const assignedTechnician = technicians.find(t => t.id === workOrder?.assigned_to);

  // Initialize answers + labor + parts from existing work order
  useEffect(() => {
    if (workOrder?.checklist) {
      const existingAnswers = {};
      workOrder.checklist.forEach(item => {
        if (item.answer !== undefined) existingAnswers[item.id] = item.answer;
      });
      setAnswers(existingAnswers);
    }
    if (workOrder?.labor_entries?.length) setLaborEntries(workOrder.labor_entries);
    if (workOrder?.parts_used?.length) setPartsUsed(workOrder.parts_used);
  }, [workOrder]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.WorkOrder.update(workOrderId, data);
    },
    onSuccess: () => queryClient.invalidateQueries(['workOrder', workOrderId]),
  });

  const checklist = workOrder?.checklist || [];
  const currentItem = checklist[currentStep];
  
  const completedCount = checklist.filter(item => {
    const answer = answers[item.id];
    if (item.type === 'boolean') return answer !== undefined;
    return answer !== undefined && answer !== '';
  }).length;
  
  const completionPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;
  const allRequiredComplete = checklist.filter(i => i.required).every(item => {
    const answer = answers[item.id];
    if (item.type === 'boolean') return answer !== undefined;
    return answer !== undefined && answer !== '';
  });

  const handleAnswerChange = (itemId, value) => {
    setAnswers(prev => ({ ...prev, [itemId]: value }));
  };

  const handlePhotoUpload = async (itemId, file) => {
    if (!navigator.onLine) {
      // Store as data URL for offline
      const reader = new FileReader();
      reader.onload = () => {
        setAnswers(prev => ({ ...prev, [itemId]: reader.result }));
      };
      reader.readAsDataURL(file);
      return;
    }
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAnswers(prev => ({ ...prev, [itemId]: file_url }));
  };

  // Media capture (offline-capable)
  const handleMediaCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (navigator.onLine) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.WorkOrderMedia.create({
        work_order_id: workOrderId,
        file_url,
        file_type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
        file_name: file.name,
        description: '',
        category: 'evidence',
        uploaded_by_name: currentUser?.full_name || '',
        uploaded_by_email: currentUser?.email || '',
      });
      queryClient.invalidateQueries(['wo-media', workOrderId]);
    } else {
      // Queue media for later upload
      const reader = new FileReader();
      reader.onload = () => {
        const item = {
          workOrderId,
          dataUrl: reader.result,
          fileName: file.name,
          fileType: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
          category: 'evidence',
          uploadedByName: currentUser?.full_name || '',
          uploadedByEmail: currentUser?.email || '',
        };
        offlineStore.enqueueMedia(item);
        setOfflineMedia(offlineStore.getMediaQueue().filter(m => m.workOrderId === workOrderId));
      };
      reader.readAsDataURL(file);
    }
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  // Add labor entry
  const addLabor = () => {
    if (!newLabor.technician || !newLabor.hours) return;
    setLaborEntries(prev => [...prev, { 
      technician: newLabor.technician, 
      date: new Date().toISOString().split('T')[0], 
      hours: Number(newLabor.hours), 
      hourly_rate: 75, 
      description: newLabor.description 
    }]);
    setNewLabor({ technician: '', hours: '', description: '' });
  };

  // Add part
  const addPart = () => {
    if (!newPart.part_name) return;
    setPartsUsed(prev => [...prev, { 
      part_name: newPart.part_name, 
      part_number: '', 
      quantity: Number(newPart.quantity) || 1, 
      unit_cost: 0 
    }]);
    setNewPart({ part_name: '', quantity: 1 });
  };

  const saveProgress = async (complete = false) => {
    setIsSaving(true);
    
    const updatedChecklist = checklist.map(item => ({
      ...item,
      answer: answers[item.id] ?? item.answer,
      completed: answers[item.id] !== undefined && answers[item.id] !== '',
      completed_at: answers[item.id] !== undefined ? new Date().toISOString() : item.completed_at,
      photo_url: item.type === 'photo' ? answers[item.id] : item.photo_url
    }));

    const updateData = {
      checklist: updatedChecklist,
      checklist_completion_percent: completionPercent,
      checklist_completed: allRequiredComplete,
      labor_entries: laborEntries,
      parts_used: partsUsed,
      history: [...(workOrder.history || []), {
        timestamp: new Date().toISOString(),
        action: complete ? 'Checklist Completed' : 'Checklist Progress Saved',
        user: assignedTechnician?.name || currentUser?.full_name || 'Technician',
        details: `${completedCount}/${checklist.length} items (${completionPercent}%)`
      }]
    };

    if (complete && allRequiredComplete) {
      updateData.status = 'completed';
      updateData.actual_end = new Date().toISOString();
    }

    if (navigator.onLine) {
      await updateMutation.mutateAsync(updateData);
    } else {
      // Queue for sync when back online
      offlineStore.enqueue({ type: 'update', entityName: 'WorkOrder', id: workOrderId, data: updateData });
      // Also update local cache immediately
      offlineStore.cacheWorkOrder({ ...workOrder, ...updateData });
    }

    setIsSaving(false);
    if (complete) setShowComplete(true);
  };

  const getPriorityColor = (priority) => {
    const colors = { urgent: 'bg-rose-500', high: 'bg-orange-500', medium: 'bg-amber-500', low: 'bg-emerald-500' };
    return colors[priority] || colors.medium;
  };

  // Load offline media on mount
  useEffect(() => {
    setOfflineMedia(offlineStore.getMediaQueue().filter(m => m.workOrderId === workOrderId));
  }, [workOrderId]);

  if (isLoading && !workOrder) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Work Order Not Found</h2>
        <p className="text-sm text-slate-500 mb-4">
          {isOffline ? 'This work order has not been cached for offline use.' : 'The work order could not be loaded.'}
        </p>
        <Link to={createPageUrl('Maintenance')}>
          <Button variant="outline">Back to Maintenance</Button>
        </Link>
      </div>
    );
  }

  if (showComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-500 to-emerald-600 p-4 flex flex-col items-center justify-center text-white">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-emerald-500" />
        </motion.div>
        <h1 className="text-2xl font-bold mb-2">Checklist Complete!</h1>
        <p className="text-emerald-100 mb-2 text-center">
          Work order {workOrder.work_order_number} has been marked as completed.
        </p>
        {isOffline && (
          <p className="text-emerald-200 text-sm mb-6 flex items-center gap-1">
            <CloudOff className="w-4 h-4" /> Changes will sync when you're back online
          </p>
        )}
        <Link to={createPageUrl('Maintenance')}>
          <Button className="bg-white text-emerald-600 hover:bg-emerald-50">Back to Maintenance</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Link to={createPageUrl('Maintenance')}>
              <Button variant="ghost" size="sm" className="text-slate-600 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              {isOffline && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  <WifiOff className="w-3 h-3 mr-1" /> Offline
                </Badge>
              )}
              <Badge className={`${getPriorityColor(workOrder.priority)} text-white`}>
                {workOrder.priority}
              </Badge>
            </div>
          </div>
          
          <h1 className="text-lg font-semibold text-slate-900 mb-1 line-clamp-1">{workOrder.title}</h1>
          <p className="text-sm text-slate-500 mb-3">{workOrder.work_order_number}</p>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4">
            <div className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /><span className="truncate">{equipment?.name || workOrder._cachedEquipmentName || 'Equipment'}</span></div>
            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /><span className="truncate">{equipment?.location || 'N/A'}</span></div>
            <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /><span className="truncate">{assignedTechnician?.name || 'Technician'}</span></div>
            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><span>{workOrder.scheduled_start ? format(new Date(workOrder.scheduled_start), 'MMM d') : 'Not set'}</span></div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-100 w-full">
              <TabsTrigger value="checklist" className="flex-1 text-xs">Checklist</TabsTrigger>
              <TabsTrigger value="labor" className="flex-1 text-xs">Labor ({laborEntries.length})</TabsTrigger>
              <TabsTrigger value="parts" className="flex-1 text-xs">Parts ({partsUsed.length})</TabsTrigger>
              <TabsTrigger value="media" className="flex-1 text-xs">Media</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Checklist Tab */}
      {activeTab === 'checklist' && (
        <>
          {!checklist.length ? (
            <div className="p-4 text-center py-12">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">No Checklist</h2>
              <p className="text-slate-500 text-sm">This work order has no checklist items.</p>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="px-4 pt-3">
                <div className="flex items-center gap-3">
                  <Progress value={completionPercent} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-slate-700">{completionPercent}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{completedCount} of {checklist.length} items completed</p>
              </div>

              {/* Step indicators */}
              <div className="flex overflow-x-auto px-4 py-3 gap-1.5">
                {checklist.map((item, idx) => {
                  const isAnswered = answers[item.id] !== undefined && answers[item.id] !== '';
                  return (
                    <button key={item.id} onClick={() => setCurrentStep(idx)}
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                        idx === currentStep ? 'bg-indigo-600 text-white'
                        : isAnswered ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                      }`}>
                      {isAnswered ? <Check className="w-4 h-4" /> : idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Current Question */}
              <div className="p-4">
                <AnimatePresence mode="wait">
                  <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-xs text-slate-500">Question {currentStep + 1} of {checklist.length}</span>
                        {currentItem?.required && <Badge variant="outline" className="ml-2 text-xs bg-rose-50 text-rose-600 border-rose-200">Required</Badge>}
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-6">{currentItem?.question}</h3>

                    <div className="space-y-4">
                      {currentItem?.type === 'text' && (
                        <Textarea value={answers[currentItem.id] || ''} onChange={(e) => handleAnswerChange(currentItem.id, e.target.value)} placeholder="Enter your answer..." className="min-h-[120px] text-base" />
                      )}
                      {currentItem?.type === 'number' && (
                        <Input type="number" value={answers[currentItem.id] || ''} onChange={(e) => handleAnswerChange(currentItem.id, e.target.value)} placeholder="Enter a number..." className="text-lg h-12" />
                      )}
                      {currentItem?.type === 'boolean' && (
                        <div className="flex gap-3">
                          <HapticButton variant={answers[currentItem.id] === 'yes' ? 'default' : 'outline'} className={`flex-1 h-14 text-base ${answers[currentItem.id] === 'yes' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`} onClick={() => handleAnswerChange(currentItem.id, 'yes')}>
                            <CheckCircle2 className="w-5 h-5 mr-2" /> Yes
                          </HapticButton>
                          <HapticButton variant={answers[currentItem.id] === 'no' ? 'default' : 'outline'} className={`flex-1 h-14 text-base ${answers[currentItem.id] === 'no' ? 'bg-rose-600 hover:bg-rose-700' : ''}`} onClick={() => handleAnswerChange(currentItem.id, 'no')}>
                            <Circle className="w-5 h-5 mr-2" /> No
                          </HapticButton>
                        </div>
                      )}
                      {currentItem?.type === 'dropdown' && (
                        <Select value={answers[currentItem.id] || ''} onValueChange={(v) => handleAnswerChange(currentItem.id, v)}>
                          <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select an option..." /></SelectTrigger>
                          <SelectContent>
                            {currentItem.options?.map((option, idx) => <SelectItem key={idx} value={option} className="text-base">{option}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                      {currentItem?.type === 'photo' && (
                        <div className="space-y-3">
                          {answers[currentItem.id] && <img src={answers[currentItem.id]} alt="Uploaded" className="w-full h-48 object-cover rounded-lg" />}
                          <Label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                            <Camera className="w-8 h-8 text-slate-400 mb-2" />
                            <span className="text-sm text-slate-500">{answers[currentItem.id] ? 'Replace photo' : 'Take or upload photo'}</span>
                            <input id="photo-upload" type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(currentItem.id, e.target.files[0]); }} />
                          </Label>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          )}
        </>
      )}

      {/* Labor Tab */}
      {activeTab === 'labor' && (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h4 className="font-medium text-slate-700 mb-3">Log Labor Hours</h4>
            <div className="space-y-2">
              <Input placeholder="Technician name" value={newLabor.technician} onChange={(e) => setNewLabor({ ...newLabor, technician: e.target.value })} />
              <Input type="number" placeholder="Hours" value={newLabor.hours} onChange={(e) => setNewLabor({ ...newLabor, hours: e.target.value })} />
              <Input placeholder="Description (optional)" value={newLabor.description} onChange={(e) => setNewLabor({ ...newLabor, description: e.target.value })} />
              <Button onClick={addLabor} className="w-full bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4 mr-1" /> Add Entry</Button>
            </div>
          </div>
          {laborEntries.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
              <div><p className="font-medium text-slate-700 text-sm">{entry.technician}</p><p className="text-xs text-slate-500">{entry.date} — {entry.description}</p></div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">{entry.hours}h</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => setLaborEntries(prev => prev.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Parts Tab */}
      {activeTab === 'parts' && (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h4 className="font-medium text-slate-700 mb-3">Log Parts Used</h4>
            <div className="space-y-2">
              <Input placeholder="Part name" value={newPart.part_name} onChange={(e) => setNewPart({ ...newPart, part_name: e.target.value })} />
              <Input type="number" placeholder="Quantity" value={newPart.quantity} onChange={(e) => setNewPart({ ...newPart, quantity: e.target.value })} />
              <Button onClick={addPart} className="w-full bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4 mr-1" /> Add Part</Button>
            </div>
          </div>
          {partsUsed.map((part, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2"><Package className="w-4 h-4 text-slate-400" /><p className="font-medium text-slate-700 text-sm">{part.part_name}</p></div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">×{part.quantity}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => setPartsUsed(prev => prev.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Tab */}
      {activeTab === 'media' && (
        <div className="p-4 space-y-4">
          <input ref={mediaInputRef} type="file" className="hidden" accept="image/*,video/*" capture="environment" onChange={handleMediaCapture} />
          <Button onClick={() => mediaInputRef.current?.click()} className="w-full bg-indigo-600 hover:bg-indigo-700">
            <Camera className="w-4 h-4 mr-2" /> Capture Photo / Video
          </Button>
          {isOffline && offlineMedia.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-amber-600 flex items-center gap-1"><CloudOff className="w-3 h-3" /> {offlineMedia.length} file(s) queued for upload</p>
              {offlineMedia.map((m) => (
                <div key={m._id} className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                  {m.dataUrl && <img src={m.dataUrl} className="w-12 h-12 rounded object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{m.fileName}</p>
                    <p className="text-[10px] text-amber-600">Will upload when online</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isOffline && offlineMedia.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-8">Capture photos or videos as evidence. Works offline too!</p>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex gap-3 z-20" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
        {activeTab === 'checklist' && checklist.length > 0 ? (
          <>
            <Button variant="outline" className="flex-1 h-12" disabled={currentStep === 0} onClick={() => setCurrentStep(prev => prev - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            {currentStep < checklist.length - 1 ? (
              <Button className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700" onClick={() => setCurrentStep(prev => prev + 1)}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700" disabled={!allRequiredComplete || isSaving} onClick={() => saveProgress(true)}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} Complete
              </Button>
            )}
          </>
        ) : (
          <Button className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700" disabled={isSaving} onClick={() => saveProgress(false)}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Progress {isOffline && '(Offline)'}
          </Button>
        )}
      </div>

      {/* Floating save for checklist tab */}
      {activeTab === 'checklist' && checklist.length > 0 && (
        <div className="fixed bottom-20 right-4 z-20">
          <Button size="sm" variant="outline" className="shadow-lg bg-white" disabled={isSaving} onClick={() => saveProgress(false)}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}