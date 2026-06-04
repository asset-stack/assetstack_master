import React, { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'encryption', label: 'Encryption' },
  { id: 'authentication', label: 'Authentication & Access' },
  { id: 'isolation', label: 'Data Isolation' },
  { id: 'rls', label: 'Row & Field Security' },
  { id: 'backend', label: 'Application Security' },
  { id: 'audit', label: 'Audit Logging' },
  { id: 'rbac', label: 'Access Control' },
  { id: 'residency', label: 'Data Residency' },
  { id: 'threats', label: 'Threat Mitigation' },
  { id: 'compliance', label: 'Compliance' },
];

export default function SecurityDocsNav() {
  const [active, setActive] = useState('overview');

  useEffect(() => {
    const handler = () => {
      let current = 'overview';
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 160) current = s.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className="hidden lg:block sticky top-28 self-start">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-slate-200">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => scrollTo(s.id)}
              className={`block w-full text-left text-[13px] pl-4 -ml-px border-l-2 py-1.5 transition-colors ${
                active === s.id
                  ? 'border-[#1925aa] text-[#1925aa] font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}