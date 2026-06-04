import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Cpu, Wrench, Brain, BarChart3, 
  Settings, Menu, X, ChevronRight, Radio, Sparkles, Box, FileText, TrendingDown, CalendarClock,
  UserCircle, Users, Shield, MessageSquare, MapPin, KeyRound, Briefcase, Hammer, Upload,
  ChevronDown, GitBranch, Globe2, FlaskConical, ShieldCheck,
  Package, Wallet, Building2, CalendarDays, AlertOctagon, Banknote,
  Target, FlaskConical as FlaskIcon, ClipboardCheck, TrendingUp, Smartphone,
  ShieldAlert, Waves, Camera, Filter, Edit3, Rocket, Layout as LayoutIcon, LogOut, Radar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { useClient } from '@/lib/ClientContext';
import OfflineIndicator from '@/components/mobile/OfflineIndicator';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import MobileHeader from '@/components/mobile/MobileHeader';
import QuickActionsFAB from '@/components/mobile/QuickActionsFAB';
import GuidedTour from '@/components/mobile/GuidedTour';
import OfflineSyncEngine from '@/components/mobile/OfflineSyncEngine';

const navSections = [
  {
    label: null,
    items: [
      { name: 'Command Center', icon: Sparkles, page: 'CommandCenter' },
      { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
      { name: 'AssetMind', icon: MessageSquare, page: 'AIAssistant' },
      { name: 'Opportunity Radar', icon: Radar, page: 'Opportunities' },
    ]
  },
  {
    label: 'People',
    items: [
      { name: 'My Profile', icon: UserCircle, page: 'MyProfile' },
      { name: 'Company Profile', icon: Building2, page: 'CompanyProfile' },
      { name: 'Manager View', icon: Shield, page: 'ManagerDashboard' },
      { name: 'Team', icon: Users, page: 'TeamDirectory' },
    ]
  },
  {
    label: 'Assets',
    items: [
      { name: 'Digital Twin', icon: Box, page: 'DigitalTwin' },
      { name: 'Locations', icon: MapPin, page: 'Locations' },
      { name: 'Asset Tree', icon: GitBranch, page: 'AssetTree' },
      { name: 'Equipment', icon: Cpu, page: 'Equipment' },
      { name: 'Sensors', icon: Radio, page: 'SensorIntegration' },
      { name: 'Scan Analysis', icon: Sparkles, page: 'ScanAnalysis' },
      { name: 'Network Globe', icon: Globe2, page: 'NetworkGlobe' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { name: 'Maintenance', icon: Wrench, page: 'Maintenance' },
      { name: 'Planning', icon: CalendarClock, page: 'MaintenancePlanning' },
      { name: 'Predictions', icon: Brain, page: 'Predictions' },
      { name: 'Spare Parts', icon: Package, page: 'SpareParts' },
      { name: 'Suppliers', icon: Building2, page: 'Suppliers' },
      { name: 'Compliance', icon: ShieldCheck, page: 'Compliance' },
      { name: 'Depreciation', icon: TrendingDown, page: 'Depreciation' },
      { name: 'Savings Ledger', icon: ShieldCheck, page: 'SavingsLedger' },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { name: 'Analytics', icon: BarChart3, page: 'Analytics' },
      { name: 'Reports', icon: FileText, page: 'Reports' },
      { name: 'ML Models', icon: Brain, page: 'MLModels' },
      { name: 'Defect Cascade', icon: GitBranch, page: 'DefectCascade' },
      { name: 'Portfolio Insights', icon: Brain, page: 'PortfolioInsights' },
      { name: 'Data Quality', icon: ShieldAlert, page: 'DataQuality' },
      { name: 'Cohort Performance', icon: TrendingUp, page: 'CohortPerformance' },
      { name: 'Climate Risk', icon: Waves, page: 'ClimateRisk' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { name: 'Finance Hub', icon: Banknote, page: 'Finance' },
      { name: 'Valuation', icon: Banknote, page: 'Valuation' },
      { name: 'Defect Backlog', icon: AlertOctagon, page: 'DefectBacklog' },
      { name: 'Funding Optimiser', icon: Target, page: 'FundingOptimiser' },
      { name: 'Scenario Modeller', icon: FlaskIcon, page: 'ScenarioModeller' },
      { name: 'Cost Center', icon: Wallet, page: 'CostCenter' },
      { name: 'Capital Plan', icon: CalendarDays, page: 'CapitalPlan' },
      { name: 'Projects', icon: Rocket, page: 'Projects' },
    ]
  },
  {
    label: 'Field Ops',
    items: [
      { name: 'Condition Inspector', icon: Sparkles, page: 'ConditionInspector' },
      { name: 'Condition Report', icon: ClipboardCheck, page: 'ConditionDefects' },
      { name: 'Verify Reports', icon: ShieldCheck, page: 'VerifyReports' },
      { name: 'Field Survey', icon: Smartphone, page: 'FieldSurvey' },
      { name: 'Inspection Cycles', icon: ClipboardCheck, page: 'InspectionCycles' },
      { name: 'Bulk Update', icon: Edit3, page: 'BulkUpdate' },
      { name: 'Photo Library', icon: Camera, page: 'PhotoLibrary' },
      { name: 'Photo Diff', icon: Camera, page: 'PhotoDiff' },
    ]
  },
  {
    label: 'Field Ops Add-ons',
    items: [
      { name: 'Smart Filters', icon: Filter, page: 'SavedViews' },
    ]
  },
  {
    label: 'Contractor Hub',
    items: [
      { name: 'Job Board', icon: Briefcase, page: 'JobBoard' },
      { name: 'Contractor Portal', icon: Hammer, page: 'ContractorPortal' },
    ]
  },
  {
    label: 'Labs',
    items: [
      { name: 'Beta Features', icon: FlaskConical, page: 'BetaFeatures' },
    ]
  },
  {
    label: 'Admin',
    items: [
      { name: 'Client Accounts', icon: Users, page: 'SuperAdminClients' },
      { name: 'Security Center', icon: ShieldCheck, page: 'SecurityCenter' },
      { name: 'SWSC Audit', icon: FileText, page: 'SWSCAudit' },
      { name: 'Landing Editor', icon: LayoutIcon, page: 'LandingEditor' },
      { name: 'Setup Guide', icon: Sparkles, page: 'SetupGuide' },
      { name: 'Setup', icon: Settings, page: 'Onboarding' },
      { name: 'Import Data', icon: Upload, page: 'DataImport' },
      { name: 'Roles', icon: KeyRound, page: 'RoleManagement' },
      { name: 'Settings', icon: Settings, page: 'Settings' },
    ]
  },
];

// Flat list for mobile menu
const allNavItems = navSections.flatMap(s => s.items);

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentClient, clients, setClient } = useClient();

  // Accordion sidebar: keep only the hub containing the active page expanded.
  const activeSectionIdx = navSections.findIndex((s) => s.items.some((i) => i.page === currentPageName));
  const [openSection, setOpenSection] = useState(activeSectionIdx);
  useEffect(() => {
    if (activeSectionIdx >= 0) setOpenSection(activeSectionIdx);
  }, [activeSectionIdx]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <OfflineIndicator />
      <OfflineSyncEngine />
      <GuidedTour />

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 76 }}
        className="hidden lg:flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-100 fixed h-screen z-50"
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-100/60">
          <div className="flex items-center gap-3">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6970c68cc08dbe7897c72f22/b4bbff453_WhatsAppImage2026-02-11at124516.jpeg" alt="AssetStack" className="w-10 h-10 rounded-xl shadow-lg shadow-indigo-500/20 object-cover" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h1 className="font-bold text-slate-900 text-base tracking-tight">AssetStack</h1>
                  <p className="text-[11px] text-slate-400 font-medium">Asset Management</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {sidebarOpen && (
            <div className="mt-4">
              {clients?.length > 1 ? (
                <>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Active Account</p>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-md p-1.5 text-slate-700 font-medium focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                    value={currentClient?.id || ''}
                    onChange={(e) => setClient(clients.find(c => c.id === e.target.value))}
                  >
                    {clients.map(c => <option key={c.id} value={c.id}>{c.business_name}</option>)}
                  </select>
                </>
              ) : (
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <img 
                    src={currentClient?.business_name === 'Bunbury Council' ? 'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/5899e3e31_logo1.png' : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentClient?.business_name || 'Client')}&background=e0e7ff&color=4f46e5`}
                    alt="Client Logo" 
                    className="w-8 h-8 rounded-lg object-contain bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Client Portal</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{currentClient?.business_name || 'Loading...'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {navSections.map((section, sIdx) => {
            const hasLabel = !!section.label;
            const collapsible = hasLabel && sidebarOpen;
            const isOpen = !collapsible || openSection === sIdx;
            return (
            <div key={sIdx}>
              {collapsible && (
                <button
                  onClick={() => setOpenSection(openSection === sIdx ? -1 : sIdx)}
                  className="w-full flex items-center justify-between px-3 pt-4 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
                >
                  <span>{section.label}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                </button>
              )}
              {hasLabel && !sidebarOpen && sIdx > 0 && (
                <div className="mx-3 my-2 border-t border-slate-100" />
              )}
              {isOpen && section.items.map((item) => {
                const isActive = currentPageName === item.page;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={isActive ? 2.5 : 2} />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`text-[13px] truncate ${isActive ? 'font-semibold' : 'font-medium'}`}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && sidebarOpen && (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-auto shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
            );
          })}
        </nav>

        {/* Collapse toggle and Logout */}
        <div className="p-2 border-t border-slate-100/60 flex flex-col gap-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <Menu className="w-4 h-4" />
            {sidebarOpen && <span className="text-xs font-medium">Collapse</span>}
          </button>
          <button
            onClick={() => base44.auth.logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="text-xs font-medium">Log out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 z-50 flex items-center justify-between px-4" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)', height: 'calc(52px + env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-center gap-2.5">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6970c68cc08dbe7897c72f22/b4bbff453_WhatsAppImage2026-02-11at124516.jpeg" alt="AssetStack" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-semibold text-slate-900 text-sm">AssetStack</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-600 h-10 w-10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden fixed inset-0 z-40 bg-white"
            style={{ paddingTop: 'calc(52px + env(safe-area-inset-top, 0px))' }}
          >
            <nav className="p-3 overflow-y-auto flex flex-col gap-4" style={{ maxHeight: 'calc(100vh - 52px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 70px)', paddingBottom: '16px' }}>
              <div>
                {navSections.map((section, sIdx) => (
                  <div key={sIdx}>
                    {section.label && (
                      <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{section.label}</p>
                    )}
                    {section.items.map((item) => {
                      const isActive = currentPageName === item.page;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.page}
                          to={createPageUrl(item.page)}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                            isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 active:bg-slate-50'
                          }`}
                        >
                          <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className="font-medium text-sm">{item.name}</span>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-auto" />}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => base44.auth.logout()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                  <span className="font-medium text-sm">Log out</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main 
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-[260px]' : 'lg:ml-[76px]'
        } lg:pt-0`}
        style={{ paddingTop: 'calc(52px + env(safe-area-inset-top, 0px))' }}
      >
        <MobileHeader currentPageName={currentPageName} />
        <div className="max-w-[1480px] mx-auto pb-20 lg:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav currentPageName={currentPageName} />

      {/* Quick Actions FAB */}
      <QuickActionsFAB />
    </div>
  );
}