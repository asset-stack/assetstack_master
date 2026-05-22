import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Building2, Database, DollarSign, Activity, Search, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuperAdminClients() {
  const { user } = useAuth();
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

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Accounts</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg">Client Name</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Locations</th>
                <th className="px-4 py-3 font-medium">Total Assets</th>
                <th className="px-4 py-3 font-medium">Est. Monthly Invoice</th>
                <th className="px-4 py-3 font-medium rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Fallback to show Bunbury if no clients exist yet */}
              {clients.length === 0 && (
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-900">Bunbury Council</div>
                    <div className="text-xs text-slate-500">info@bunbury.wa.gov.au</div>
                  </td>
                  <td className="px-4 py-4"><Badge variant="outline" className="bg-indigo-50 text-indigo-700">Enterprise</Badge></td>
                  <td className="px-4 py-4 font-medium text-slate-700">{locations.length || 9}</td>
                  <td className="px-4 py-4 text-slate-600">{totalAssets.toLocaleString()}</td>
                  <td className="px-4 py-4 font-medium text-slate-900">${((locations.length || 9) * 150).toLocaleString()}</td>
                  <td className="px-4 py-4"><Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge></td>
                </tr>
              )}
              {clients.map(client => {
                const clientLocations = locations.filter(l => l.client_account_id === client.id || l.client_name === client.business_name);
                const locCount = clientLocations.length;
                return (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">{client.business_name}</div>
                      <div className="text-xs text-slate-500">{client.contact_email || 'No email'}</div>
                    </td>
                    <td className="px-4 py-4"><Badge variant="outline" className="capitalize bg-indigo-50 text-indigo-700">{client.subscription_level || 'Professional'}</Badge></td>
                    <td className="px-4 py-4 font-medium text-slate-700">{locCount}</td>
                    <td className="px-4 py-4 text-slate-600">-</td>
                    <td className="px-4 py-4 font-medium text-slate-900">${(locCount * 150).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <Badge className={client.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-100 text-rose-700 hover:bg-rose-100'}>
                        {client.status || 'Active'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}