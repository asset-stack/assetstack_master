import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, AlertTriangle, Wrench, Brain, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function NotificationSettings() {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({
    email_critical_alerts: currentUser?.email_critical_alerts !== false,
    email_maintenance_due: currentUser?.email_maintenance_due !== false,
    email_task_assigned: currentUser?.email_task_assigned !== false,
    email_ai_predictions: currentUser?.email_ai_predictions !== false,
    email_weekly_report: currentUser?.email_weekly_report !== false,
    email_equipment_status: currentUser?.email_equipment_status !== false,
    email_work_order_updates: currentUser?.email_work_order_updates !== false,
    email_contractor_activity: currentUser?.email_contractor_activity !== false,
  });

  React.useEffect(() => {
    if (currentUser) {
      setPrefs({
        email_critical_alerts: currentUser.email_critical_alerts !== false,
        email_maintenance_due: currentUser.email_maintenance_due !== false,
        email_task_assigned: currentUser.email_task_assigned !== false,
        email_ai_predictions: currentUser.email_ai_predictions !== false,
        email_weekly_report: currentUser.email_weekly_report !== false,
        email_equipment_status: currentUser.email_equipment_status !== false,
        email_work_order_updates: currentUser.email_work_order_updates !== false,
        email_contractor_activity: currentUser.email_contractor_activity !== false,
      });
    }
  }, [currentUser]);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const toggle = (key) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  const notifications = [
    { key: 'email_critical_alerts', icon: AlertTriangle, label: 'Critical Alerts', desc: 'Get notified when equipment reaches critical status', color: 'text-red-500' },
    { key: 'email_maintenance_due', icon: Wrench, label: 'Maintenance Due', desc: 'Reminders for upcoming scheduled maintenance', color: 'text-amber-500' },
    { key: 'email_task_assigned', icon: Bell, label: 'Task Assigned', desc: 'When a maintenance task is assigned to you', color: 'text-blue-500' },
    { key: 'email_ai_predictions', icon: Brain, label: 'AI Predictions', desc: 'AI-generated failure predictions and recommendations', color: 'text-purple-500' },
    { key: 'email_weekly_report', icon: Mail, label: 'Weekly Digest', desc: 'Weekly summary of fleet health and operations', color: 'text-indigo-500' },
    { key: 'email_equipment_status', icon: AlertTriangle, label: 'Equipment Status Changes', desc: 'When equipment moves between operational states', color: 'text-orange-500' },
    { key: 'email_work_order_updates', icon: Wrench, label: 'Work Order Updates', desc: 'Status changes on work orders you\'re involved in', color: 'text-emerald-500' },
    { key: 'email_contractor_activity', icon: Bell, label: 'Contractor Activity', desc: 'New applications, invitations, and contractor updates', color: 'text-violet-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-2">
          <Mail className="w-4 h-4 text-indigo-500" />
          Email Notifications
        </h3>
        <p className="text-xs text-slate-500 mb-4">Choose which notifications you receive via email.</p>
      </div>

      <div className="space-y-1">
        {notifications.map(({ key, icon: Icon, label, desc, color }) => (
          <div key={key} className="flex items-center justify-between p-3 sm:p-4 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${color}`} />
              <div>
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
            <Switch checked={prefs[key]} onCheckedChange={() => toggle(key)} />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button onClick={() => saveMutation.mutate(prefs)} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]">
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-300" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saved ? 'Saved!' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}