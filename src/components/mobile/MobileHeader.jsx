import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// Pages that are bottom-tab roots — no back button shown
const ROOT_PAGES = ['Dashboard', 'Equipment', 'Maintenance', 'AIAssistant', 'MyProfile'];

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

  // Root tabs don't need a sub-header (Dashboard has its own, others use layout header)
  if (isRoot) return null;

  return (
    <div className="lg:hidden bg-white border-b border-slate-100 select-none">
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-sm font-semibold text-slate-900 truncate">
          {title}
        </h1>
      </div>
    </div>
  );
}