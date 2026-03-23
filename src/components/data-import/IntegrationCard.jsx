import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Save, CheckCircle, X, ExternalLink } from 'lucide-react';

export default function IntegrationCard({ integration }) {
  const Icon = integration.icon;
  const [url, setUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const storageKey = `integration_${integration.id}`;

  React.useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      const val = user?.[storageKey];
      if (val) { setUrl(val); setSaved(true); }
    };
    load();
  }, [storageKey]);

  const handleSave = async () => {
    if (!url.trim()) return;
    await base44.auth.updateMe({ [storageKey]: url.trim() });
    setSaved(true);
  };

  const handleRemove = async () => {
    await base44.auth.updateMe({ [storageKey]: '' });
    setUrl('');
    setSaved(false);
    setExpanded(false);
  };

  // Embeddable integrations show iframe
  const isEmbeddable = integration.embeddable;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${integration.color} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">{integration.title}</h3>
              {saved && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                  <CheckCircle className="w-3 h-3" /> Connected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{integration.desc}</p>
            <span className="inline-block text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full mt-2">{integration.category}</span>
          </div>
        </div>

        {/* Connect / Configure */}
        {integration.configurable && (
          <div className="mt-3">
            {!expanded && !saved && (
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setExpanded(true)}>
                Configure
              </Button>
            )}
            {(expanded || saved) && (
              <div className="space-y-2 mt-2">
                <Label className="text-[10px] text-slate-500">{integration.urlLabel || 'URL / Connection String'}</Label>
                <Input
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setSaved(false); }}
                  placeholder={integration.placeholder}
                  className="text-xs h-9"
                />
                {integration.helpText && (
                  <p className="text-[10px] text-slate-400">{integration.helpText}</p>
                )}
                <div className="flex items-center gap-2">
                  <Button onClick={handleSave} disabled={!url.trim()} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs flex-1">
                    <Save className="w-3 h-3 mr-1" /> Save
                  </Button>
                  {saved && (
                    <Button variant="ghost" size="sm" className="text-xs text-rose-500" onClick={handleRemove}>
                      <X className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!integration.configurable && integration.externalUrl && (
          <a href={integration.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block">
            <Button variant="outline" size="sm" className="w-full text-xs">
              <ExternalLink className="w-3 h-3 mr-1" /> Open {integration.title}
            </Button>
          </a>
        )}
      </div>

      {/* Embed iframe if applicable */}
      {saved && isEmbeddable && url && (
        <div className="border-t border-slate-200">
          <iframe title={integration.title} src={url} className="w-full h-[400px]" frameBorder="0" allowFullScreen />
        </div>
      )}
    </div>
  );
}