import React from 'react';

/**
 * A single A4 page in the brochure.
 * - 210mm x 297mm at print, scaled to viewport on screen.
 * - Cream paper, ink type, indigo accent.
 * - Forces a page break after itself when printing.
 */
export default function BrochureShell({
  pageNumber,
  section,
  title,
  children,
  variant = 'light', // 'light' | 'dark' | 'cover'
}) {
  const bg =
    variant === 'dark'
      ? 'bg-[#0E1116] text-[#F5F2EA]'
      : variant === 'cover'
      ? 'bg-[#0E1116] text-[#F5F2EA]'
      : 'bg-[#F8F5EE] text-[#0E1116]';

  return (
    <section
      className={`brochure-page ${bg} relative mx-auto my-6 print:my-0 shadow-2xl print:shadow-none`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '18mm 18mm 16mm 18mm',
        pageBreakAfter: 'always',
        breakAfter: 'page',
        fontFeatureSettings: '"ss01","cv01","cv02"',
      }}
    >
      {/* Header strip */}
      {variant !== 'cover' && (
        <header className="flex items-center justify-between border-b border-current/15 pb-3 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-[9px] font-bold tracking-[0.28em] uppercase opacity-70">
              AssetStack · Feature Brochure
            </span>
          </div>
          <span className="text-[9px] font-bold tracking-[0.28em] uppercase opacity-50 tabular-nums">
            {section}
          </span>
        </header>
      )}

      {/* Optional title block — most spreads render their own hero, so this is opt-in */}
      {title && (
        <div className="mb-6">
          <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-indigo-600 mb-2">
            {section}
          </div>
          <h1
            className="text-[44px] leading-[1.02] tracking-[-0.03em] font-black"
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
          >
            {title}
          </h1>
        </div>
      )}

      <div className="brochure-body">{children}</div>

      {/* Footer */}
      {variant !== 'cover' && (
        <footer
          className="absolute left-0 right-0 flex items-center justify-between px-[18mm] text-[9px] tracking-[0.2em] uppercase opacity-50 font-semibold"
          style={{ bottom: '8mm' }}
        >
          <span>assetstack.ai</span>
          <span className="tabular-nums">{String(pageNumber).padStart(2, '0')} / 14</span>
        </footer>
      )}
    </section>
  );
}