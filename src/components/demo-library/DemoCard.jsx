import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function DemoCard({ demo, onDeleted }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const shareUrl = `${window.location.origin}/demo/${demo.demo_slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete the "${demo.business_name}" demo? This removes the account and its data.`)) return;
    setDeleting(true);
    await base44.entities.ClientAccount.delete(demo.id);
    onDeleted?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 hover-lift"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900 truncate">{demo.business_name}</h3>
          <p className="text-xs text-slate-400 font-mono truncate">/demo/{demo.demo_slug}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-500 truncate">
          {shareUrl}
        </div>
        <Button size="icon" variant="outline" className="shrink-0" onClick={handleCopy}>
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => window.open(shareUrl, '_blank')}
        >
          <ExternalLink className="w-4 h-4" /> Open
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 shrink-0"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}