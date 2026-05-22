import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Building2, Database, DollarSign, Activity, Search, ShieldCheck, ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuperAdminClients() {
  const { user } = useAuth();
  const [expandedClients, setExpandedClients] = useState({});

  const toggleClient = (id) => {
    setExpandedClients(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const { data: rawClients = [], isLoading } = useQuery({
    queryKey: ['adminClients'],
    queryFn: () => base44.entities.ClientAccount.list('-created_date', 100),
  });

  const clients = rawClients.filter(c => !c.allowed_users?.length || c.allowed_users.includes(user?.email));

  const { data: locations = [] } = useQuery({
    queryKey: ['adminLocations'],
    queryFn: () => base44.entities.Location.list('-created_date', 1000),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['adminEquipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 1000),
  });

  // Calculate totals
  const totalInvoicing = (locations.length || 9) * 150; // $150 per location assumption
  const totalAssets = equipment.length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Super Admin: Client Accounts
          </h1>
          <p className="text-sm text-slate-500 mt-1">Overview of all platform tenants, data usage, and billing.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Search clients..." className="pl-9 w-full sm:w-[250px]" />
        </div>
      </div>

      {/* High-level stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Building2 className="w-5 h-5" /></div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Total Clients</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{Math.max(1, clients.length)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Monthly Revenue (Est)</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">${totalInvoicing.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Database className="w-5 h-5" /></div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Total Assets Tracked</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalAssets.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Activity className="w-5 h-5" /></div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Platform Health</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600">Operational</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Modules with Dropdowns */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Tenant Accounts</h2>
        
        {clients.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No client accounts found.</p>
          </div>
        )}

        {clients.map(client => {
          const clientLocations = locations.filter(l => l.client_account_id === client.id || l.client_name === client.business_name);
          const locCount = clientLocations.length;
          const isExpanded = expandedClients[client.id];
          
          return (
            <Card key={client.id} className="overflow-hidden">
              <div 
                className="p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => toggleClient(client.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{client.business_name}</h3>
                    <p className="text-xs text-slate-500">{client.contact_email || 'No email'}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Plan</span>
                    <Badge variant="outline" className="capitalize bg-indigo-50 text-indigo-700 mt-1">{client.subscription_level || 'Professional'}</Badge>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Locations</span>
                    <span className="font-medium text-slate-700 mt-1">{locCount}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Est. Invoice</span>
                    <span className="font-medium text-slate-900 mt-1">${(locCount * 150).toLocaleString()}/mo</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Status</span>
                    <Badge className={`mt-1 ${client.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {client.status || 'Active'}
                    </Badge>
                  </div>
                  <div className="ml-2 text-slate-400">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="bg-slate-50 border-t border-slate-100 p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Locations ({locCount})</h4>
                  
                  {locCount === 0 ? (
                    <div className="text-sm text-slate-400 bg-white p-3 rounded-lg border border-slate-200 text-center">
                      No locations assigned to this client yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {clientLocations.map((loc) => {
                        // Calculate assets per location if possible
                        const locAssets = equipment.filter(e => e.location === loc.name || e.location_id === loc.id).length;
                        return (
                          <div key={loc.id} className="bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-3 hover:border-indigo-200 transition-colors">
                            <div className="mt-0.5 text-indigo-500">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{loc.name}</p>
                              <p className="text-xs text-slate-500">{loc.city || 'No city specified'}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] font-normal text-slate-600 bg-slate-50">
                                  {locAssets} Assets
                                </Badge>
                                <Badge variant="outline" className="text-[10px] font-normal text-emerald-600 bg-emerald-50 border-emerald-100">
                                  {loc.status || 'Active'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}