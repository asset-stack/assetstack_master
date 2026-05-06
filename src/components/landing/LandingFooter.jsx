import React from 'react';
import { Twitter, Linkedin, Github } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
                <span className="text-white font-black text-sm">A</span>
              </div>
              <span className="font-bold text-slate-900 text-lg">AssetStack</span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs">
              AI-powered asset intelligence with a defensible audit trail. Built for the teams who maintain the world.
            </p>
            <div className="flex gap-3 mt-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-slate-600" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Product', links: ['Features', 'Live demo', 'Pricing', 'Security', 'Roadmap'] },
            { title: 'Company', links: ['About', 'Customers', 'Careers', 'Press', 'Contact'] },
            { title: 'Resources', links: ['Docs', 'API', 'Blog', 'Help center', 'Status'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-sm text-slate-900 mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© 2026 AssetStack. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Security</a>
            <a href="#" className="hover:text-slate-900">DPA</a>
          </div>
        </div>
      </div>
    </footer>
  );
}