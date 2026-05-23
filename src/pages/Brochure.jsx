import React, { useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import Spread01Cover from '@/components/brochure/Spread01Cover';
import Spread02Stakes from '@/components/brochure/Spread02Stakes';
import Spread03Platform from '@/components/brochure/Spread03Platform';
import Spread04AssetTree from '@/components/brochure/Spread04AssetTree';
import Spread05DigitalTwin from '@/components/brochure/Spread05DigitalTwin';
import Spread06Predict from '@/components/brochure/Spread06Predict';
import Spread07AssetMind from '@/components/brochure/Spread07AssetMind';
import Spread08CapitalPlan from '@/components/brochure/Spread08CapitalPlan';
import Spread09Scenarios from '@/components/brochure/Spread09Scenarios';
import Spread10FieldOps from '@/components/brochure/Spread10FieldOps';
import Spread11Savings from '@/components/brochure/Spread11Savings';
import Spread12Trust from '@/components/brochure/Spread12Trust';
import Spread13Rollout from '@/components/brochure/Spread13Rollout';
import Spread14Close from '@/components/brochure/Spread14Close';

const SPREADS = [
  Spread01Cover, Spread02Stakes, Spread03Platform, Spread04AssetTree,
  Spread05DigitalTwin, Spread06Predict, Spread07AssetMind, Spread08CapitalPlan,
  Spread09Scenarios, Spread10FieldOps, Spread11Savings, Spread12Trust,
  Spread13Rollout, Spread14Close,
];

export default function Brochure() {
  useEffect(() => {
    document.title = 'AssetStack — Feature Brochure';
    // Load Fraunces serif for editorial headlines
    const id = 'brochure-fraunces';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,900&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <>
      {/* Toolbar — hidden on print */}
      <div className="print:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            to="/Landing"
            className="w-8 h-8 rounded-md bg-slate-800 hover:bg-slate-700 grid place-items-center"
            aria-label="Back to landing"
          >
            <X className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-sm font-bold">AssetStack · Feature Brochure</div>
            <div className="text-[10px] opacity-60">14 pages · A4 · designed for print or PDF</div>
          </div>
        </div>
        <Button
          onClick={() => window.print()}
          className="bg-indigo-500 hover:bg-indigo-600 text-white gap-2 h-9 text-sm font-bold"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </Button>
      </div>

      <div className="brochure-root bg-slate-200 print:bg-white pt-20 print:pt-0 pb-12 print:pb-0 min-h-screen">
        {SPREADS.map((Spread, i) => (
          <Spread key={i} />
        ))}
      </div>

      <style>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          html, body, #root, .brochure-root {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .brochure-page {
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .print\\:hidden { display: none !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
}