import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CreateDemoDialog({ open, onOpenChange, onCreated }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const effectiveSlug = slugTouched ? slugify(slug) : slugify(name);

  const handleCreate = async () => {
    if (!name.trim() || !effectiveSlug) return;
    setSaving(true);
    await base44.entities.ClientAccount.create({
      business_name: name.trim(),
      demo_slug: effectiveSlug,
      is_demo_account: true,
      subscription_level: 'enterprise',
      status: 'active',
      allowed_users: [],
    });
    setSaving(false);
    setName('');
    setSlug('');
    setSlugTouched(false);
    onCreated?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New demo environment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="demo-name">Company / prospect name</Label>
            <Input
              id="demo-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Snowy Hydro"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="demo-slug">Link slug</Label>
            <Input
              id="demo-slug"
              value={effectiveSlug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
              placeholder="snowyhydro"
            />
            <p className="text-xs text-slate-400">
              Share link: <span className="font-mono">/demo/{effectiveSlug || '…'}</span>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving || !name.trim() || !effectiveSlug}>
            {saving ? 'Creating…' : 'Create demo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}