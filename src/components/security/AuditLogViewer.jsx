import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Eye, Search, Download, Loader2, ShieldAlert, Shield, Database,
  Bot, Cog, DollarSign, ChevronDown, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_META = {
  security:  { icon: ShieldAlert, color: 'text-red-600 bg-red-50 border-red-200' },
  admin:     { icon: Shield,      color: 'text-purple-600 bg-purple-50 border-purple-200' },
  data:      { icon: Database,    color: 'text-blue-600 bg-blue-50 border-blue-200' },
  ai:        { icon: Bot,         color: 'text-pink-600 bg-pink-50 border-pink-200' },
  financial: { icon: DollarSign,  color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  system:    { icon: Cog,         color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

const SEVERITY_COLOR = {
  info:     'bg-slate-100 text-slate-700',
  notice:   'bg-blue-100 text-blue-700',
  warning:  'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

function LogRow({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[entry.category] || CATEGORY_META.system;
  const Icon = meta.icon;

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
        <div className={`w-7 h-7 rounded-md flex items-center justify-center border ${meta.color} shrink-0`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold text-slate-900">{entry.action}</span>
            <Badge className={`${SEVERITY_COLOR[entry.severity] || SEVERITY_COLOR.info} text-[9px] border-0`}>
              {entry.severity}
            </Badge>
            {entry.outcome === 'denied' && (
              <Badge className="bg-red-100 text-red-700 border-0 text-[9px]">DENIED</Badge>
            )}
            {entry.outcome === 'failure' && (
              <Badge className="bg-amber-100 text-amber-700 border-0 text-[9px]">FAILED</Badge>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 truncate">
            {entry.summary || entry.target_name || entry.target_entity}
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-500 shrink-0">
          <div className="font-medium text-slate-700">{entry.actor_email}</div>
          <div>{format(new Date(entry.created_date), 'MMM d, HH:mm:ss')}</div>
        </div>
      </button>

      {expanded && (
        <div className="px-3 py-3 bg-slate-50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Actor</div>
            <div className="text-slate-700">{entry.actor_email}</div>
            <div className="text-slate-500">Role: <span className="font-mono">{entry.actor_role || 'user'}</span></div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Target</div>
            <div className="text-slate-700">{entry.target_entity || '—'}</div>
            {entry.target_id && <div className="text-slate-500 font-mono text-[10px] truncate">{entry.target_id}</div>}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Origin</div>
            <div className="text-slate-700">IP: <span className="font-mono">{entry.ip_hint || '—'}</span></div>
            <div className="text-slate-500 truncate">{entry.user_agent}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Outcome</div>
            <div className="text-slate-700 capitalize">{entry.outcome}</div>
          </div>
          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
            <div className="md:col-span-2">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Metadata</div>
              <pre className="bg-white border border-slate-200 rounded p-2 text-[10px] text-slate-700 overflow-x-auto">
                {JSON.stringify(entry.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuditLogViewer() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [severity, setSeverity] = useState('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['auditLog'],
    queryFn: () => base44.entities.AuditLogEntry.list('-created_date', 500),
    refetchInterval: 30000,
  });

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (category !== 'all' && l.category !== category) return false;
      if (severity !== 'all' && l.severity !== severity) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = [l.action, l.actor_email, l.target_entity, l.target_name, l.summary]
          .filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [logs, search, category, severity]);

  const exportCSV = () => {
    const rows = [
      ['Date', 'Actor', 'Role', 'Action', 'Category', 'Severity', 'Target', 'Outcome', 'Summary', 'IP'],
      ...filtered.map((l) => [
        l.created_date,
        l.actor_email,
        l.actor_role || '',
        l.action,
        l.category || '',
        l.severity || '',
        `${l.target_entity || ''}:${l.target_id || ''}`,
        l.outcome || '',
        (l.summary || '').replace(/"/g, '""'),
        l.ip_hint || '',
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="w-5 h-5 text-indigo-600" />
            Audit Log
            <Badge variant="outline" className="text-[10px] ml-1">{logs.length} entries</Badge>
          </CardTitle>
          <Button onClick={exportCSV} variant="outline" size="sm" disabled={filtered.length === 0}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          Immutable record of every privileged action. Refreshes every 30 seconds.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action, actor, target…"
              className="pl-9 h-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="data">Data</SelectItem>
              <SelectItem value="ai">AI</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="notice">Notice</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading audit log…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Eye className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">
              {logs.length === 0 ? 'No audit entries yet' : 'No entries match your filters'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {logs.length === 0
                ? 'Trigger an AI scan, retrain a model, or import data — entries will appear here.'
                : 'Try clearing the filters above.'}
            </p>
          </div>
        ) : (
          <div className="max-h-[700px] overflow-y-auto">
            {filtered.map((entry) => <LogRow key={entry.id} entry={entry} />)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}