import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Cpu, Wrench, Brain, BarChart3, 
  Settings, Menu, X, ChevronRight, Radio
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Equipment', icon: Cpu, page: 'Equipment' },
  { name: 'Sensors', icon: Radio, page: 'SensorIntegration' },
  { name: 'Maintenance', icon: Wrench, page: 'Maintenance' },
  { name: 'Predictions', icon: Brain, page: 'Predictions' },
  { name: 'Analytics', icon: BarChart3, page: 'Analytics' },
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
        animate={{ width: sidebarOpen ? 256 : 72 }}
        className="hidden lg:flex flex-col bg-white border-r border-slate-200 fixed h-screen z-50 shadow-sm"
      >
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h1 className="font-semibold text-slate-900 text-lg tracking-tight">PredictAI</h1>
                  <p className="text-xs text-slate-500">Maintenance Platform</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            const Icon = item.icon;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium"
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

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900">PredictAI</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-600"
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
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-[72px]'
        } pt-16 lg:pt-0`}
      >
        <div className="max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}