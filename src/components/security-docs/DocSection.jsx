import React from 'react';

export default function DocSection({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="scroll-mt-28 py-10 border-b border-slate-100 last:border-0">
      {eyebrow && (
        <p className="text-[11px] font-semibold text-[#1925aa] uppercase tracking-wider mb-2">
          {eyebrow}
        </p>
      )}
      <h2
        className="text-slate-900 font-bold tracking-[-0.02em] mb-5"
        style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)' }}
      >
        {title}
      </h2>
      <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-900 prose-headings:text-slate-900">
        {children}
      </div>
    </section>
  );
}