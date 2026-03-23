import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, Trash2, Loader2, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const DOC_TYPES = [
  { value: 'user_manual', label: 'User Manual' },
  { value: 'maintenance_guide', label: 'Maintenance Guide' },
  { value: 'safety_procedure', label: 'Safety Procedure' },
  { value: 'specification', label: 'Specification' },
  { value: 'warranty', label: 'Warranty' },
  { value: 'training_material', label: 'Training Material' },
  { value: 'sop', label: 'SOP' },
  { value: 'other', label: 'Other' },
];

export default function DocumentManager({ open, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', document_type: 'user_manual', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['asset-documents'],
    queryFn: () => base44.entities.AssetDocument.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AssetDocument.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['asset-documents'] }),
  });

  const handleUpload = async () => {
    if (!selectedFile || !newDoc.name) return;
    setUploading(true);
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
    
    let extracted_content = '';
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (['pdf', 'csv', 'xlsx', 'json', 'html', 'png', 'jpg', 'jpeg'].includes(ext)) {
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: { type: 'object', properties: { content: { type: 'string' } } }
      });
      if (result.status === 'success' && result.output?.content) {
        extracted_content = result.output.content;
      }
    }

    await base44.entities.AssetDocument.create({
      ...newDoc,
      file_url,
      extracted_content,
    });

    queryClient.invalidateQueries({ queryKey: ['asset-documents'] });
    setNewDoc({ name: '', document_type: 'user_manual', description: '' });
    setSelectedFile(null);
    setUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            Knowledge Base - Training Documents
          </DialogTitle>
        </DialogHeader>

        {/* Upload Section */}
        <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
          <p className="text-sm font-medium text-slate-700">Add Documentation</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Document name"
              value={newDoc.name}
              onChange={(e) => setNewDoc(prev => ({ ...prev, name: e.target.value }))}
            />
            <Select value={newDoc.document_type} onValueChange={(v) => setNewDoc(prev => ({ ...prev, document_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="Description (optional)"
            value={newDoc.description}
            onChange={(e) => setNewDoc(prev => ({ ...prev, description: e.target.value }))}
          />
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                <Upload className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  {selectedFile ? selectedFile.name : 'Choose file (PDF, images, CSV, Excel)'}
                </span>
              </div>
              <input type="file" className="hidden" accept=".pdf,.csv,.xlsx,.xls,.json,.html,.png,.jpg,.jpeg" onChange={(e) => setSelectedFile(e.target.files[0])} />
            </label>
            <Button onClick={handleUpload} disabled={!selectedFile || !newDoc.name || uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto space-y-2 mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No documents uploaded yet. Add manuals and guides to train the AI.</div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs">{DOC_TYPES.find(t => t.value === doc.document_type)?.label}</Badge>
                      {doc.extracted_content && <Badge variant="outline" className="text-xs text-green-600">AI Indexed</Badge>}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(doc.id)} className="text-slate-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}