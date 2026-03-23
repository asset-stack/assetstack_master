import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Building2, Users, Shield, Bell, Database, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import GeneralSettings from '@/components/settings/GeneralSettings';
import TeamSettings from '@/components/settings/TeamSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import DataSettings from '@/components/settings/DataSettings';

// Inline the roles & permissions content from RoleManagement page
import RoleManagement from './RoleManagement';

const TAB_ITEMS = [
  { value: 'general', label: 'General', icon: Building2, mobileLabel: 'General' },
  { value: 'team', label: 'Team Members', icon: Users, mobileLabel: 'Team' },
  { value: 'permissions', label: 'Roles & Permissions', icon: Shield, mobileLabel: 'Roles' },
  { value: 'notifications', label: 'Notifications', icon: Bell, mobileLabel: 'Alerts' },
  { value: 'data', label: 'Data & Integrations', icon: Database, mobileLabel: 'Data' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-8" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 80px)' }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-indigo-600" />
            Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your organisation, team, permissions, and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation — desktop */}
          <div className="hidden lg:block w-64 shrink-0">
            <nav className="bg-white rounded-xl border border-slate-200 p-2 sticky top-4">
              {TAB_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setActiveTab(item.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Mobile Tab Bar */}
          <div className="lg:hidden overflow-x-auto -mx-4 px-4">
            <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 min-w-max">
              {TAB_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setActiveTab(item.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      isActive ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.mobileLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              {activeTab === 'general' && <GeneralSettings />}
              {activeTab === 'team' && <TeamSettings />}
              {activeTab === 'permissions' && <EmbeddedRoleManagement />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'data' && <DataSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper to embed the role management inline (without the full-page layout)
function EmbeddedRoleManagement() {
  return (
    <div className="-m-4 sm:-m-6">
      <RoleManagement />
    </div>
  );
}