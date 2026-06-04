import React from 'react';
import { ShieldCheck, FileText, Download } from 'lucide-react';

export default function SecurityDocsHero() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: '#1925aa' }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="relative z-[2] max-w-[1480px] mx-auto px-5 md:px-10 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-[12px] font-medium mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          Security Documentation
        </div>
        <h1
          className="text-white font-normal leading-[0.95] tracking-[-0.02em] max-w-4xl"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 'clamp(2.4rem, 7vw, 5.5rem)',
          }}
        >
          Security & trust, documented for review.
        </h1>
        <p className="mt-6 text-white/80 text-[15px] md:text-[17px] leading-relaxed max-w-2xl">
          A complete reference for security officers, procurement teams and
          auditors evaluating AssetStack for sensitive asset, facility and
          financial data. Every control below is independently audited and
          enforced at the infrastructure and application level.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/Contact"
            className="inline-flex items-center gap-2 bg-white text-[#1925aa] h-11 px-6 text-[14px] font-semibold rounded-md hover:bg-white/90 transition-colors"
          >
            <FileText className="w-4 h-4" /> Request SOC 2 report
          </a>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-[14px] font-medium px-5 h-11 border border-white/40 hover:border-white/80 rounded-md transition-colors"
          >
            <Download className="w-4 h-4" /> Export as PDF
          </button>
        </div>
      </div>
    </section>
  );
}