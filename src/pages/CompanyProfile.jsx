import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Building2, MapPin, CreditCard, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CompanyProfile() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['clientAccount'],
    queryFn: () => base44.entities.ClientAccount.list('-created_date', 1),
  });
  
  const { data: locations = [], isLoading: isLoadingLocs } = useQuery({
    queryKey: ['clientLocations'],
    queryFn: () => base44.entities.Location.list('-created_date', 100),
  });

  const account = accounts[0];

  const updateMutation = useMutation({
    mutationFn: (data) => {
      if (account?.id) {
        return base44.entities.ClientAccount.update(account.id, data);
      } else {
        return base44.entities.ClientAccount.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientAccount'] });
      setEditing(false);
    }
  });

  const handleEdit = () => {
    setFormData(account || { business_name: 'Bunbury Council', abn: '', contact_name: '', contact_phone: '', contact_email: '', website: '' });
    setEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoadingAccounts || isLoadingLocs) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  // Fallback info if not created
  const displayAccount = account || { business_name: 'Bunbury Council' };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Company Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your business account, locations, and subscription.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Business Details */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Business Details</CardTitle>
                <CardDescription>Your primary company information</CardDescription>
              </div>
              {!editing && (
                <Button variant="outline" size="sm" onClick={handleEdit}>Edit Details</Button>
              )}
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Business Name</label>
                      <Input value={formData.business_name || ''} onChange={e => setFormData({...formData, business_name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">ABN</label>
                      <Input value={formData.abn || ''} onChange={e => setFormData({...formData, abn: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Contact Person</label>
                      <Input value={formData.contact_name || ''} onChange={e => setFormData({...formData, contact_name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Phone</label>
                      <Input value={formData.contact_phone || ''} onChange={e => setFormData({...formData, contact_phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Email</label>
                      <Input value={formData.contact_email || ''} onChange={e => setFormData({...formData, contact_email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Website</label>
                      <Input value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                      {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Business Name</p>
                    <p className="font-medium text-slate-900">{displayAccount.business_name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">ABN</p>
                    <p className="font-medium text-slate-900">{displayAccount.abn || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Contact Person</p>
                    <p className="font-medium text-slate-900">{displayAccount.contact_name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Contact Details</p>
                    <p className="font-medium text-slate-900">{displayAccount.contact_email || 'No email'} {displayAccount.contact_phone ? `• ${displayAccount.contact_phone}` : ''}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <p className="text-xs text-slate-500 uppercase">Website</p>
                    <p className="font-medium text-slate-900">{displayAccount.website || 'Not set'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Locations ({locations.length})</CardTitle>
                <CardDescription>Manage your asset portfolio locations</CardDescription>
              </div>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" /> Add Location
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
                {locations.map(loc => (
                  <div key={loc.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{loc.name}</p>
                        <p className="text-xs text-slate-500">{loc.address || 'No address specified'}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white">{loc.status || 'Active'}</Badge>
                  </div>
                ))}
                {locations.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-sm border border-dashed border-slate-200 rounded-xl">
                    No locations added yet. Add a location to start managing your assets.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Subscription Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 mb-3 uppercase text-[10px] tracking-wider">
                  {displayAccount.subscription_level || 'Enterprise'} Plan
                </Badge>
                <p className="text-4xl font-bold text-slate-900">
                  ${(locations.length || 9) * 150}<span className="text-sm font-normal text-slate-500">/mo</span>
                </p>
                <p className="text-xs text-slate-500 mt-2">Based on {locations.length || 9} active locations ($150/loc)</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">Upgrade Plan</Button>
                <Button className="w-full text-slate-500" variant="outline">Downgrade Plan</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}