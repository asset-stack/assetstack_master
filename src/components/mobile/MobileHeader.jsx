import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// Pages considered "root" tabs — no back button shown
const ROOT_PAGES = ['Dashboard', 'Equipment', 'Maintenance', 'AIAssistant', 'MyProfile'];

// Titles for pages
const PAGE_TITLES = {
  Dashboard: 'Dashboard',
  Equipment: 'Equipment',
  Maintenance: 'Maintenance',
  AIAssistant: 'AssetMind',
  MyProfile: 'My Profile',
  Locations: 'Locations',
  Settings: 'Settings',
  Predictions: 'Predictions',
  Analytics: 'Analytics',
  SensorIntegration: 'Sensors',
  TeamDirectory: 'Team',
  JobBoard: 'Job Board',
  ContractorPortal: 'Contractor Portal',
  ContractorRegister: 'Register',
  SetupGuide: 'Setup Guide',
  DataImport: 'Data Import',
  RoleManagement: 'Roles',
  DigitalTwin: 'Digital Twin',
  Depreciation: 'Depreciation',
  MaintenancePlanning: 'Planning',
  MLModels: 'ML Models',
  Reports: 'Reports',
  ManagerDashboard: 'Manager View',
  Onboarding: 'Setup',
  MobileChecklist: 'Checklist',
};

export default function MobileHeader({ currentPageName }) {
  const navigate = useNavigate();
  const isRoot = ROOT_PAGES.includes(currentPageName);
  const title = PAGE_TITLES[currentPageName] || currentPageName || '';

  // Don't render on Dashboard — it has its own sticky header
  if (currentPageName === 'Dashboard') return null;

  return (
    <div
      className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 select-none"
      style={{ minHeight: 48 }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        {!isRoot && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 -ml-1 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
        )}
        <h1 className={`text-base font-semibold text-slate-900 truncate ${isRoot ? 'pl-1' : ''}`}>
          {title}
        </h1>
      </div>
    </div>
  );
}