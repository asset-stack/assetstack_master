import React from 'react';
import { Twitter, Linkedin, Github, FileDown } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BrandLogo from './BrandLogo';
import DownloadBrochureButton from './DownloadBrochureButton';

const COLS = [
  { title: 'Product', links: [
    { label: 'Features', href: '/Product' },
    { label: 'Live demo', href: '/Contact#contact' },
    { label: 'Pricing', href: '/Contact' },
    { label: 'Security', href: '/LandingCompliance' },
  ]},
  { title: 'Industries', links: [
    { label: 'Construction', href: '/Industries' },
    { label: 'Mining', href: '/Industries' },
    { label: 'Fleet', href: '/Industries' },
    { label: 'Manufacturing', href: '/Industries' },
    { label: 'Rail', href: '/Industries' },
    { label: 'Energy', href: '/Industries' },
  ]},
  { title: 'Company', links: [
    { label: 'About', href: '/About' },
    { label: 'Customers', href: '/Customers' },
    { label: 'Careers', href: '/Contact' },
    { label: 'Press', href: '/Contact' },
    { label: 'Contact', href: '/Contact' },
  ]},
  { title: 'Resources', links: [
    { label: 'Docs', href: '#' },
    { label: 'API', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Help center', href: '#' },
    { label: 'Status', href: '#' },
  ]},
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-10">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-[1.4fr_repeat(4,1fr)] gap-8 lg:gap-10">
          <div className="md:max-w-xs">
            <div className="mb-4">
              <BrandLogo size={32} />
            </div>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              The AI operating system for physical assets. Built for the teams who maintain the world.
            </p>
            <div className="flex gap-2 mt-5">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg border border-slate-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary flex items-center justify-center text-slate-500 transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-[12px] text-slate-900 mb-3 uppercase tracking-[0.12em]">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <RouterLink to="/PrintLanding">
              <Button variant="outline" size="sm" className="text-[12px] font-semibold gap-1.5">
                <FileDown className="w-3.5 h-3.5" />
                Export PDF
              </Button>
            </RouterLink>
            <DownloadBrochureButton
              variant="outline"
              className="text-[12px] font-semibold h-8 px-3"
              label="Download brochure"
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 text-[12px] text-slate-500">
            <p>© 2026 AssetStack, Inc. Built for the people who maintain the world.</p>
            <div className="flex gap-5">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Security</a>
              <a href="#" className="hover:text-slate-900 transition-colors">DPA</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}