import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit2, MapPin, Mail, Phone, Building2, Calendar, Shield } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

const LEVEL_COLORS = {
  junior: 'bg-slate-100 text-slate-700',
  intermediate: 'bg-blue-100 text-blue-700',
  senior: 'bg-violet-100 text-violet-700',
  expert: 'bg-amber-100 text-amber-700',
  master: 'bg-emerald-100 text-emerald-700',
};

export default function ProfileHeader({ technician, onEdit }) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Technician.update(technician.id, { profile_image_url: file_url });
    setUploading(false);
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200')] bg-cover bg-center opacity-20" />
      </div>
      
      <div className="px-6 pb-6 -mt-16 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-slate-100">
              {technician.profile_image_url ? (
                <img src={technician.profile_image_url} alt={technician.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {technician.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            <label className="absolute bottom-1 right-1 w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100">
              <Camera className="w-4 h-4 text-slate-600" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>

          {/* Info */}
          <div className="flex-1 sm:pb-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{technician.name}</h1>
              <Badge className={LEVEL_COLORS[technician.certification_level] || LEVEL_COLORS.intermediate}>
                <Shield className="w-3 h-3 mr-1" />
                {technician.certification_level || 'Intermediate'}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {technician.worker_type || 'employee'}
              </Badge>
            </div>
            {technician.bio && <p className="text-sm text-slate-500 mt-1">{technician.bio}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
              {technician.email && (
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{technician.email}</span>
              )}
              {technician.phone && (
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{technician.phone}</span>
              )}
              {technician.company_name && (
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{technician.company_name}</span>
              )}
              {technician.start_date && (
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Since {format(new Date(technician.start_date), 'MMM yyyy')}</span>
              )}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onEdit} className="shrink-0">
            <Edit2 className="w-4 h-4 mr-1" /> Edit Profile
          </Button>
        </div>

        {/* Skills */}
        {technician.skills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {technician.skills.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}