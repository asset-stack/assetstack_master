import React from 'react';
import { Recycle, Radio, ClipboardCheck, Brain } from 'lucide-react';
import SolutionsSolutionBlock from './SolutionsSolutionBlock';
import ProductModulePreview from '../product/ProductModulePreview';

const SOLUTIONS = [
  {
    title: 'Manage assets across their entire lifecycle.',
    intro:
      'AssetStack provides a complete lifecycle view of infrastructure assets from installation through operation, maintenance and replacement planning.',
    capabilities: ['Asset registry', 'Lifecycle tracking', 'Depreciation modelling', 'Maintenance history'],
    benefits: ['Improve capital planning', 'Reduce lifecycle costs', 'Increase asset reliability'],
    tone: 'blue',
    icon: Recycle,
  },
  {
    title: 'Real-time monitoring across infrastructure networks.',
    intro:
      'Integrate sensor telemetry and operational systems to monitor asset performance in real time.',
    capabilities: ['IoT sensor ingestion', 'Live telemetry dashboards', 'Threshold alerts', 'Asset health monitoring'],
    benefits: ['Detect early signs of failure', 'Increase operational visibility', 'Reduce emergency maintenance'],
    tone: 'violet',
    icon: Radio,
  },
  {
    title: 'Digitise infrastructure inspections.',
    intro:
      "Mobile inspection workflows capture structured data from field teams and feed it directly into AssetStack's analytics platform.",
    capabilities: ['Inspection checklists', 'Defect tagging', 'Image capture', 'AI-assisted inspection analysis'],
    benefits: ['Standardise inspection processes', 'Improve inspection data quality', 'Enable predictive insights'],
    tone: 'emerald',
    icon: ClipboardCheck,
  },
  {
    title: 'Optimise maintenance planning.',
    intro:
      'AssetStack prioritises maintenance tasks based on asset health, predicted failures and operational risk.',
    capabilities: ['Automated maintenance schedules', 'Risk-based prioritisation', 'Work order generation', 'Technician task management'],
    benefits: ['Reduce maintenance costs', 'Improve workforce allocation', 'Prevent unexpected failures'],
    tone: 'amber',
    icon: Brain,
  },
];

function PreviewIllustration({ Icon, label, accent, soft }) {
  return (
    <>
      <div
        className="absolute inset-0 rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm"
        style={{ boxShadow: `0 20px 60px -20px ${accent}33` }}
      />
      <div className="absolute top-3 left-3 flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-slate-300" />
        <span className="w-2 h-2 rounded-full bg-slate-300" />
        <span className="w-2 h-2 rounded-full bg-slate-300" />
      </div>
      <div
        className="absolute top-3 right-4 text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: accent }}
      >
        {label}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center"
          style={{ background: soft, color: accent }}
        >
          <Icon className="w-14 h-14" strokeWidth={1.4} />
        </div>
      </div>
      <div className="absolute bottom-5 left-5 right-5 space-y-1.5">
        {[0.85, 0.62, 0.45].map((w, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full"
            style={{ width: `${w * 100}%`, background: i === 0 ? accent : soft, opacity: i === 0 ? 0.85 : 1 }}
          />
        ))}
      </div>
    </>
  );
}

export default function SolutionsBlocks() {
  return (
    <section id="solutions" className="bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 pt-20 lg:pt-28">
        <div className="max-w-3xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary mb-4">
            The Solution
          </p>
          <h2
            className="font-normal text-slate-900 leading-[1.05] tracking-[-0.01em]"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(2rem, 4.6vw, 3.6rem)',
            }}
          >
            How AssetStack solves<br />these challenges.
          </h2>
          <p className="mt-6 text-slate-600 text-[15px] md:text-[17px] leading-relaxed">
            AssetStack connects operational data, digital twin infrastructure
            models and machine learning to deliver predictive intelligence
            across asset networks.
          </p>
        </div>
      </div>

      {SOLUTIONS.map((s, i) => (
        <SolutionsSolutionBlock
          key={s.title}
          index={i + 1}
          title={s.title}
          intro={s.intro}
          capabilities={s.capabilities}
          benefits={s.benefits}
          reverse={i % 2 === 1}
          preview={
            <ProductModulePreview tone={s.tone}>
              {({ accent, soft }) => (
                <PreviewIllustration
                  Icon={s.icon}
                  label={s.title.split(' ').slice(0, 2).join(' ')}
                  accent={accent}
                  soft={soft}
                />
              )}
            </ProductModulePreview>
          }
        />
      ))}
    </section>
  );
}