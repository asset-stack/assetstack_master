import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { LayoutDashboard, Cpu, Wrench, Brain, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { name: 'Home', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Assets', icon: Cpu, page: 'Equipment' },
  { name: 'Tasks', icon: Wrench, page: 'Maintenance' },
  { name: 'AI', icon: Brain, page: 'Predictions' },
  { name: 'Profile', icon: UserCircle, page: 'MyProfile' },
];

export default function MobileBottomNav({ currentPageName }) {
  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <nav className="flex items-center justify-around px-2 pt-1.5 pb-1">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPageName === item.page;
          const Icon = item.icon;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px] relative"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-1.5 w-5 h-0.5 bg-indigo-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}