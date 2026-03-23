import React, { useState } from 'react';
import { BarChart3, ExternalLink, Save, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

export default function PowerBIEmbed() {
  const [embedUrl, setEmbedUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [showEmbed, setShowEmbed] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load saved URL from user data on mount
  React.useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      if (user?.powerbi_embed_url) {
        setSavedUrl(user.powerbi_embed_url);
        setEmbedUrl(user.powerbi_embed_url);
        setShowEmbed(true);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!embedUrl.trim()) return;
    setSaving(true);
    await base44.auth.updateMe({ powerbi_embed_url: embedUrl.trim() });
    setSavedUrl(embedUrl.trim());
    setShowEmbed(true);
    setSaving(false);
  };

  const handleRemove = async () => {
    await base44.auth.updateMe({ powerbi_embed_url: '' });
    setSavedUrl('');
    setEmbedUrl('');
    setShowEmbed(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Power BI Dashboard</h3>
            <p className="text-xs text-slate-500">Embed your Power BI reports directly into AssetStack</p>
          </div>
        </div>

        {!showEmbed ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">Power BI Embed URL</Label>
              <Input
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="https://app.powerbi.com/reportEmbed?reportId=..."
                className="text-sm"
              />
              <p className="text-[10px] text-slate-400 mt-1.5">
                In Power BI → File → Embed report → Website or portal → Copy the embed URL
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={!embedUrl.trim() || saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-xs w-full"
              size="sm"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {saving ? 'Saving...' : 'Save & Preview'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="font-medium">Connected</span>
              </div>
              <div className="flex items-center gap-1">
                <a href={savedUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500">
                    <ExternalLink className="w-3 h-3 mr-1" /> Open in Power BI
                  </Button>
                </a>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-500 hover:text-rose-600" onClick={handleRemove}>
                  <X className="w-3 h-3 mr-1" /> Remove
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded iframe */}
      {showEmbed && savedUrl && (
        <div className="border-t border-slate-200">
          <iframe
            title="Power BI Report"
            src={savedUrl}
            className="w-full h-[500px]"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}