import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Box, Database, Plug, ShieldCheck, Check } from 'lucide-react';

const CAPS = [
  {
    icon: Brain,
    title: 'AI-powered infrastructure intelligence.',
    intro: "AssetStack's predictive engine uses machine learning to analyse asset behaviour and identify early warning signals of equipment degradation.",
    a: { label: 'Capabilities', items: ['Anomaly detection', 'Failure classification', 'Predictive maintenance modelling', 'Remaining useful life prediction'] },
    b: { label: 'AI models used', items: ['Isolation Forest', 'LSTM Autoencoders', 'Ensemble Predictive Models', 'Weibull Reliability Models'] },
    c: { label: 'Benefits', items: ['Predict failures earlier', 'Improve maintenance planning', 'Increase asset reliability'] },
  },
  {
    icon: Box,
    title: 'Digital twin infrastructure models.',
    intro: 'Visualise asset networks using digital twins and geospatial mapping for a spatial understanding of infrastructure systems in context.',
    a: { label: 'Capabilities', items: ['3D infrastructure models', 'GIS asset mapping', 'LiDAR integration', 'Asset performance overlays'] },
    b: null,
    c: { label: 'Benefits', items: ['Better operational visibility', 'Improved infrastructure planning', 'Enhanced inspection workflows'] },
  },
  {
    icon: Database,
    title: 'Unified infrastructure data platform.',
    intro: 'Integrates data from multiple operational systems into a unified platform that acts as the single source of truth for infrastructure assets.',
    a: { label: 'Capabilities', items: ['Real-time data ingestion', 'Structured asset data modelling', 'High-volume data processing', 'Secure cloud infrastructure'] },
    b: { label: 'Data sources', items: ['IoT sensors', 'Inspection reports', 'Asset registries', 'Maintenance systems', 'Operational databases'] },
    c: null,
  },
  {
    icon: Plug,
    title: 'Built to integrate with your systems.',
    intro: 'AssetStack integrates with existing infrastructure systems and enterprise software platforms.',
    a: { label: 'Capabilities', items: ['API integrations', 'Data connectors', 'Secure data pipelines'] },
    b: { label: 'Integration types', items: ['IoT platforms', 'GIS systems', 'SCADA systems', 'Enterprise asset management', 'Cloud data platforms'] },
    c: null,
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise-grade security and scalability.',
    intro: 'Built to support large-scale infrastructure networks and enterprise operational environments.',
    a: { label: 'Features', items: ['Cloud-native architecture', 'Secure data access controls', 'Scalable infrastructure monitoring', 'High availability platform'] },
    b: null,
    c: { label: 'Benefits', items: ['Reliable platform performance', 'Secure infrastructure data', 'Support for large asset fleets'] },
  },
];

function List({ label, items }) {
  if (!items) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-3">{label}</p>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-primary mt-1 shrink-0" strokeWidth={2.5} />
            <span className="text-[13.5px] text-slate-700 leading-snug">{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ComplianceCapabilities() {
  return (
    <section className="bg-white">
      {CAPS.map((cap, idx) => {
        const Icon = cap.icon;
        return (
          <div key={cap.title} className="py-16 lg:py-24 border-t border-slate-100">
            <div className="max-w-[1280px] mx-auto px-5 md:px-10">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mb-10"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[11px] font-bold tabular-nums text-primary">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
                  </div>
                </div>
                <h3
                  className="font-normal text-slate-900 leading-[1.08] tracking-[-0.01em]"
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: 'clamp(1.7rem, 3.2vw, 2.6rem)',
                  }}
                >
                  {cap.title}
                </h3>
                <p className="mt-4 text-slate-700 text-[15px] leading-relaxed">{cap.intro}</p>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <List label={cap.a.label} items={cap.a.items} />
                <List label={cap.b?.label} items={cap.b?.items} />
                <List label={cap.c?.label} items={cap.c?.items} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}