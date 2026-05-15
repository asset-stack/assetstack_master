import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BrandLogo from './BrandLogo';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '/Landing#tour', label: 'Product' },
    { href: '/Landing#proof', label: 'Proof' },
    { href: '/Industries', label: 'Industries', isRoute: true },
    { href: '/CaseStudies', label: 'Case studies', isRoute: true },
    { href: '/Landing#pricing', label: 'Pricing' },
    { href: '/Landing#security', label: 'Security' },
  ];

  const handleSignIn = () => {
    base44.auth.redirectToLogin('/CommandCenter');
  };

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/70' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 flex items-center justify-between h-16">
        <Link to="/Landing" className="group">
          <BrandLogo size={32} />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) =>
            l.isRoute ? (
              <Link
                key={l.href}
                to={l.href}
                className="px-3 py-2 text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {l.label}
              </a>
            )
          )}
        </div>

        <div className="hidden lg:flex items-center gap-1">
          <Button onClick={handleSignIn} variant="outline" size="sm" className="text-slate-800 border-slate-300 hover:bg-slate-50 text-[13px] font-semibold">
            Sign in
          </Button>
          <a href="#contact">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white elevation-2 text-[13px] font-semibold">
              Book a demo <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </a>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-slate-700">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1">
          {links.map((l) =>
            l.isRoute ? (
              <Link key={l.href} to={l.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                {l.label}
              </a>
            )
          )}
          <Button onClick={handleSignIn} variant="outline" className="w-full mt-2">
            Sign in
          </Button>
          <a href="#contact" className="block" onClick={() => setMobileOpen(false)}>
            <Button className="w-full mt-2 bg-primary hover:bg-primary/90 text-white">Book a demo</Button>
          </a>
        </div>
      )}
    </motion.nav>
  );
}