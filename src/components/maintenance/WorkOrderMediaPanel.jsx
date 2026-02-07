import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Video, FileText, Upload, Trash2, Loader2, Image, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'evidence', label: 'Evidence', color: 'bg-red-50 text-red-700' },
  { value: 'before', label: 'Before', color: 'bg-amber-50 text-amber-700' },
  { value: 'after', label: 'After', color: 'bg-emerald-50 text-emerald-700' },
  { value: 'issue', label: 'Issue Found', color: 'bg-rose-50 text-rose-700' },
  { value: 'repair', label: 'Repair', color: 'bg-blue-50 text-blue-700' },
  { value: 'inspection', label: 'Inspection', color: 'bg-violet-50 text-violet-700' },
  { value: 'other', label: 'Other', color: 'bg-slate-50 text-slate-700' },
];

export default function WorkOrderMediaPanel({ workOrderId }) {
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('evidence');
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['wo-media', workOrderId],
    queryFn: () => base44.entities.WorkOrderMedia.filter({ work_order_id: workOrderId }, '-created_date', 100),
    enabled: !!workOrderId,
  });

  const uploadMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkOrderMedia.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wo-media', workOrderId] });
      setDescription('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WorkOrderMedia.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wo-media', workOrderId] }),
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    let file_type = 'document';
    if (file.type.startsWith('image/')) file_type = 'image';
    else if (file.type.startsWith('video/')) file_type = 'video';

    uploadMutation.mutate({
      work_order_id: workOrderId,
      file_url,
      file_type,
      file_name: file.name,
      description: description || file.name,
      category,
      uploaded_by_name: currentUser?.full_name || 'Unknown',
      uploaded_by_email: currentUser?.email || '',
    });
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getCategoryConfig = (cat) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[6];

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (!workOrderId) {
    return <p className="text-center text-slate-400 py-8 text-sm">Save the work order first to add media.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h4 className="font-medium text-slate-700 mb-3">Upload Photo, Video or Document</h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-white sm:col-span-2"
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-indigo-600 hover:bg-indigo-700 w-full"
            >
              {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
              Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : media.length === 0 ? (
        <div className="text-center py-8">
          <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No media attached yet</p>
          <p className="text-slate-400 text-xs">Upload photos, videos, or documents as evidence</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {media.map((item) => {
            const catConfig = getCategoryConfig(item.category);
            return (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:border-indigo-300 transition-colors">
                {/* Preview */}
                {item.file_type === 'image' ? (
                  <div className="relative aspect-video bg-slate-100 cursor-pointer" onClick={() => setPreviewUrl(item.file_url)}>
                    <img src={item.file_url} alt={item.description} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ) : item.file_type === 'video' ? (
                  <div className="aspect-video bg-slate-900 flex items-center justify-center">
                    <video src={item.file_url} controls className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-50 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-slate-300" />
                  </div>
                )}
                {/* Info */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-[10px] ${catConfig.color}`}>{catConfig.label}</Badge>
                    {getFileIcon(item.file_type)}
                  </div>
                  <p className="text-xs font-medium text-slate-700 truncate">{item.description || item.file_name}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {item.uploaded_by_name} • {format(new Date(item.created_date), 'MMM d, h:mm a')}
                  </p>
                  <div className="flex gap-1 mt-2">
                    <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500">
                        <Download className="w-3 h-3 mr-1" /> Download
                      </Button>
                    </a>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-rose-500"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Preview */}
      {previewUrl && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewUrl(null)}
        >
          <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}