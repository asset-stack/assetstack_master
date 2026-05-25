import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link as RouterLink } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import DownloadBrochureButton from './DownloadBrochureButton';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      // Hero is 100vh — swap logo once user scrolls past it
      setPastHero(window.scrollY > window.innerHeight - 80);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const links = [
    { href: '/Product', label: 'Product', isRoute: true },
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
          {pastHero ? (
            <BrandLogo size={32} />
          ) : (
            <img
              src="https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/c1034c5ca_AssetStack_Logo_Whitecopy.png"
              alt="AssetStack"
              className="block h-7 w-auto"
            />
          )}
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) =>
            l.isRoute ? (
              <Link
                key={l.href}
                to={l.href}
                className={`px-3 py-2 text-[13px] font-medium transition-colors ${
                  pastHero
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-white/85 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className={`px-3 py-2 text-[13px] font-medium transition-colors ${
                  pastHero
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-white/85 hover:text-white'
                }`}
              >
                {l.label}
              </a>
            )
          )}
        </div>

        <div className="hidden lg:flex items-center gap-1.5">
          <RouterLink to="/PrintLanding">
            <Button
              variant="ghost"
              size="sm"
              className={`text-[13px] font-semibold ${
                pastHero
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-white hover:bg-white/10 hover:text-white'
              }`}
            >
              Export PDF
            </Button>
          </RouterLink>
          <DownloadBrochureButton
            variant="ghost"
            className={`text-[13px] font-semibold ${
              pastHero
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-white hover:bg-white/10 hover:text-white'
            }`}
            label="Brochure"
          />
          <Button
            onClick={handleSignIn}
            variant="outline"
            size="sm"
            className={`text-[13px] font-semibold ${
              pastHero
                ? 'text-slate-800 border-slate-300 hover:bg-slate-50'
                : 'text-white border-white/50 bg-transparent hover:bg-white/10 hover:text-white'
            }`}
          >
            Sign in
          </Button>
          <a href="#contact">
            <Button
              size="sm"
              className={`text-[13px] font-semibold elevation-2 ${
                pastHero
                  ? 'bg-primary hover:bg-primary/90 text-white'
                  : 'bg-white text-[#1925aa] hover:bg-white/90'
              }`}
            >
              Book a demo <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`lg:hidden p-2 ${pastHero ? 'text-slate-700' : 'text-white'}`}
        >
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
          <div className="pt-2">
            <DownloadBrochureButton variant="outline" className="w-full" label="Download brochure" />
          </div>
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