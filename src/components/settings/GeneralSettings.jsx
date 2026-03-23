import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Building2, Globe, Phone, Mail, MapPin, Loader2, CheckCircle2 } from 'lucide-react';

export default function GeneralSettings() {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    organisation_name: currentUser?.organisation_name || 'Bunbury Council',
    organisation_type: currentUser?.organisation_type || 'local_government',
    primary_contact_name: currentUser?.primary_contact_name || '',
    primary_contact_email: currentUser?.primary_contact_email || '',
    primary_contact_phone: currentUser?.primary_contact_phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || 'Bunbury',
    region: currentUser?.region || 'Western Australia',
    country: currentUser?.country || 'Australia',
    timezone: currentUser?.timezone || 'Australia/Perth',
    currency: currentUser?.currency || 'AUD',
    date_format: currentUser?.date_format || 'DD/MM/YYYY',
  });

  // Sync settings from user data when it loads
  React.useEffect(() => {
    if (currentUser) {
      setSettings(prev => ({
        ...prev,
        organisation_name: currentUser.organisation_name || prev.organisation_name,
        organisation_type: currentUser.organisation_type || prev.organisation_type,
        primary_contact_name: currentUser.primary_contact_name || prev.primary_contact_name,
        primary_contact_email: currentUser.primary_contact_email || prev.primary_contact_email,
        primary_contact_phone: currentUser.primary_contact_phone || prev.primary_contact_phone,
        address: currentUser.address || prev.address,
        city: currentUser.city || prev.city,
        region: currentUser.region || prev.region,
        country: currentUser.country || prev.country,
        timezone: currentUser.timezone || prev.timezone,
        currency: currentUser.currency || prev.currency,
        date_format: currentUser.date_format || prev.date_format,
      }));
    }
  }, [currentUser]);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      {/* Organisation Info */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-500" />
          Organisation Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Organisation Name</Label>
            <Input value={settings.organisation_name} onChange={e => update('organisation_name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Organisation Type</Label>
            <Select value={settings.organisation_type} onValueChange={v => update('organisation_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="local_government">Local Government</SelectItem>
                <SelectItem value="state_government">State Government</SelectItem>
                <SelectItem value="utility">Utility Company</SelectItem>
                <SelectItem value="transport">Transport Authority</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="facilities">Facilities Management</SelectItem>
                <SelectItem value="mining">Mining & Resources</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Phone className="w-4 h-4 text-indigo-500" />
          Primary Contact
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Contact Name</Label>
            <Input value={settings.primary_contact_name} onChange={e => update('primary_contact_name', e.target.value)} placeholder="John Smith" />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input type="email" value={settings.primary_contact_email} onChange={e => update('primary_contact_email', e.target.value)} placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Contact Phone</Label>
            <Input value={settings.primary_contact_phone} onChange={e => update('primary_contact_phone', e.target.value)} placeholder="+61 4XX XXX XXX" />
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-500" />
          Address
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-2">
            <Label>Street Address</Label>
            <Input value={settings.address} onChange={e => update('address', e.target.value)} placeholder="123 Main Street" />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={settings.city} onChange={e => update('city', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Region / State</Label>
            <Input value={settings.region} onChange={e => update('region', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input value={settings.country} onChange={e => update('country', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Regional Preferences */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-500" />
          Regional Preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={settings.timezone} onValueChange={v => update('timezone', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Australia/Perth">Australia/Perth (AWST)</SelectItem>
                <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                <SelectItem value="Australia/Adelaide">Australia/Adelaide (ACST)</SelectItem>
                <SelectItem value="Australia/Brisbane">Australia/Brisbane (AEST)</SelectItem>
                <SelectItem value="Asia/Bangkok">Asia/Bangkok (ICT)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={settings.currency} onValueChange={v => update('currency', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AUD">AUD ($)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="THB">THB (฿)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date Format</Label>
            <Select value={settings.date_format} onValueChange={v => update('date_format', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]">
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-300" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}