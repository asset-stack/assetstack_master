import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Cpu, Wrench, Brain, BarChart3, 
  Settings, Menu, X, ChevronRight, Radio, Sparkles, Box, FileText, TrendingDown, CalendarClock,
  UserCircle, Users
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'My Profile', icon: UserCircle, page: 'MyProfile' },
  { name: 'Team', icon: Users, page: 'TeamDirectory' },
  { name: 'Setup', icon: Sparkles, page: 'Onboarding' },
  { name: 'Equipment', icon: Cpu, page: 'Equipment' },
  { name: 'Digital Twin', icon: Box, page: 'DigitalTwin' },
  { name: 'Sensors', icon: Radio, page: 'SensorIntegration' },
  { name: 'Maintenance', icon: Wrench, page: 'Maintenance' },
  { name: 'Planning', icon: CalendarClock, page: 'MaintenancePlanning' },
  { name: 'Depreciation', icon: TrendingDown, page: 'Depreciation' },
  { name: 'Predictions', icon: Brain, page: 'Predictions' },
  { name: 'Analytics', icon: BarChart3, page: 'Analytics' },
  { name: 'Reports', icon: FileText, page: 'Reports' },
  { name: 'ML Models', icon: Settings, page: 'MLModels' },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 76 }}
        className="hidden lg:flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-100 fixed h-screen z-50"
      >
        <div className="p-5 border-b border-slate-100/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h1 className="font-bold text-slate-900 text-lg tracking-tight">AssetStack</h1>
                  <p className="text-[11px] text-slate-500 font-medium">Asset Management Platform</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            const Icon = item.icon;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-50 to-indigo-100/50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50/80 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={isActive ? 2.5 : 2} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`text-[13px] ${isActive ? 'font-semibold' : 'font-medium'}`}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && sidebarOpen && (
                  <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100/60">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50/80 hover:text-slate-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
            {sidebarOpen && <span className="text-[13px] font-medium">Collapse</span>}
          </button>
        </div>
        </motion.aside>

      {/* Mobile Header - safe area aware */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4 shadow-sm" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)', height: 'calc(56px + env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900">AssetStack</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-600 h-11 w-11"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="lg:hidden fixed inset-0 z-40 bg-white pt-16"
          >
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main 
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-[260px]' : 'lg:ml-[76px]'
        } pt-16 lg:pt-0`}
      >
        <div className="max-w-[1480px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}