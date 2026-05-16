import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DownloadBrochureButton({ variant = 'default', className = '', label = 'Download platform overview' }) {
  const [status, setStatus] = useState('idle'); // idle | loading | done | error

  const handleDownload = async () => {
    if (status === 'loading') return;
    setStatus('loading');
    try {
      const res = await base44.functions.invoke('generatePlatformPresentation', {});
      // res.data is the PDF bytes (ArrayBuffer/Blob depending on SDK transport)
      const blob = res.data instanceof Blob
        ? res.data
        : new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AssetStack-Platform-Overview.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (e) {
      console.error('Download failed', e);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  const isLoading = status === 'loading';
  const isDone = status === 'done';

  return (
    <Button
      onClick={handleDownload}
      variant={variant}
      size="sm"
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          Preparing…
        </>
      ) : isDone ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
          Downloaded
        </>
      ) : (
        <>
          <FileDown className="w-3.5 h-3.5 mr-1.5" />
          {label}
        </>
      )}
    </Button>
  );
}