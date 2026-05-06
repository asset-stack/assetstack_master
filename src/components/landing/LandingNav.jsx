import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Menu, X } from 'lucide-react';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#benefits', label: 'Benefits' },
    { href: '#features', label: 'Features' },
    { href: '#industries', label: 'Industries' },
    { href: '#demo', label: 'Live Demo' },
    { href: '#security', label: 'Security' },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
        <Link to="/Landing" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">AssetStack</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/CommandCenter">
            <Button variant="ghost" size="sm" className="text-slate-700">Sign in</Button>
          </Link>
          <Link to="/CommandCenter">
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20">
              Book a demo <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
              {l.label}
            </a>
          ))}
          <Link to="/CommandCenter" className="block">
            <Button className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white">Book a demo</Button>
          </Link>
        </div>
      )}
    </motion.nav>
  );
}