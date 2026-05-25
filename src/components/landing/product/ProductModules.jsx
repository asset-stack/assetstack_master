import React from 'react';
import {
  Database, Box, Radio, ClipboardCheck, Wrench, Brain, BarChart3, Banknote,
} from 'lucide-react';
import ProductModule from './ProductModule';
import ProductModulePreview from './ProductModulePreview';
import AssetTreePreview from '../industries/previews/AssetTreePreview';
import SensorsPreview from '../industries/previews/SensorsPreview';
import DigitalTwinVideoPreview from './DigitalTwinVideoPreview';
import InspectionWorkflowPreview from './InspectionWorkflowPreview';
import MaintenanceWorkflowPreview from './MaintenanceWorkflowPreview';
import PredictiveAnalyticsPreview from './PredictiveAnalyticsPreview';
import ExecutiveReportingPreview from './ExecutiveReportingPreview';
import FinanceHubPreview from './FinanceHubPreview';

const CUSTOM_PREVIEWS = {
  'Asset Registry': AssetTreePreview,
  'Digital Twin': DigitalTwinVideoPreview,
  'IoT Sensor Integration': SensorsPreview,
  'Inspection Workflows': InspectionWorkflowPreview,
  'Maintenance Management': MaintenanceWorkflowPreview,
  'AI & Predictive Analytics': PredictiveAnalyticsPreview,
  'Executive Reporting': ExecutiveReportingPreview,
  'Finance Hub & Funding Optimiser': FinanceHubPreview,
};

const MODULES = [
  {
    badge: 'Module',
    title: 'Asset Registry',
    intro:
      'A centralised system of record for all infrastructure assets, providing a single, trusted source of truth across your organisation.',
    body:
      'AssetStack consolidates asset data from multiple systems into one unified platform, ensuring teams always work from accurate, up-to-date information.',
    capabilities: [
      'Comprehensive asset metadata including type, specifications, and ownership',
      'Geospatial location tracking across sites and regions',
      'Operational status monitoring such as active, degraded, or offline',
      'Lifecycle management from acquisition through to replacement',
      'Complete maintenance history for audit and compliance',
    ],
    outcome:
      'Better decision-making, compliance reporting, and long-term asset planning.',
    tone: 'blue',
    icon: Database,
  },
  {
    badge: 'Module',
    title: 'Digital Twin',
    intro:
      'Visualise and interact with your infrastructure through high-fidelity digital representations of real-world assets.',
    body:
      "AssetStack's digital twin layer combines 3D models, mapping data, and operational inputs into a single interface, allowing teams to monitor and analyse assets remotely.",
    capabilities: [
      '3D visualisation of assets and infrastructure networks',
      'Overlay inspection data directly onto assets',
      'Integration of live sensor data into digital models',
      'Remote inspection and condition review',
      'Historical comparison of asset changes over time',
    ],
    outcome:
      'Reduce site visits while improving understanding of asset condition and performance.',
    tone: 'sky',
    icon: Box,
  },
  {
    badge: 'Module',
    title: 'IoT Sensor Integration',
    intro:
      'Connect real-time telemetry from industrial sensors and operational systems into AssetStack to enable continuous monitoring of asset performance.',
    body:
      'The platform integrates with IoT devices, SCADA systems, and other data sources to create a live operational view of your infrastructure.',
    capabilities: [
      'Real-time data ingestion from sensors and APIs',
      'Monitoring of vibration, temperature, pressure, and operational load',
      'Threshold-based alerts and anomaly detection',
      'Scalable ingestion architecture for large asset networks',
      'Integration with legacy systems',
    ],
    outcome:
      'Early warning signals enabling proactive maintenance strategies.',
    tone: 'violet',
    icon: Radio,
  },
  {
    badge: 'Module',
    title: 'Inspection Workflows',
    intro:
      'Digitise and standardise field inspections with mobile-first workflows that ensure consistent, high-quality data capture.',
    body:
      'AssetStack replaces paper-based and inconsistent processes with structured inspection tools that integrate directly into your asset data ecosystem.',
    capabilities: [
      'Customisable inspection checklists',
      'Defect tagging and categorisation',
      'Image and media capture linked to assets',
      'AI-assisted defect identification and analysis',
      'Offline capability for remote environments',
    ],
    outcome:
      'Improved data quality, reduced human error, and consistency across teams.',
    tone: 'emerald',
    icon: ClipboardCheck,
  },
  {
    badge: 'Module',
    title: 'Maintenance Management',
    intro:
      'Plan, track, and optimise maintenance activities across your entire asset portfolio with a centralised maintenance management system.',
    body:
      'AssetStack enables organisations to shift from reactive maintenance to structured, predictive workflows that extend asset life and reduce downtime.',
    capabilities: [
      'Preventive and predictive maintenance scheduling',
      'Work order management and assignment',
      'Parts, labour and cost tracking',
      'Maintenance history and audit trails',
      'AI-generated maintenance recommendations',
    ],
    outcome:
      'Lower operating costs and longer asset life across the portfolio.',
    tone: 'amber',
    icon: Wrench,
  },
  {
    badge: 'Module',
    title: 'AI & Predictive Analytics',
    intro:
      'Machine learning models trained on your operational data to forecast asset behaviour, surface anomalies and predict failures before they happen.',
    body:
      'AssetStack combines time-series analysis, computer vision and reliability engineering models into a single predictive engine.',
    capabilities: [
      'Anomaly detection across sensor and inspection data',
      'Remaining useful life (RUL) forecasting',
      'Failure probability scoring',
      'Health index per asset and asset class',
      'Continuous model improvement from new data',
    ],
    outcome:
      'From reactive maintenance to confident, evidence-based decisions.',
    tone: 'blue',
    icon: Brain,
  },
  {
    badge: 'Module',
    title: 'Executive Reporting',
    intro:
      'Automated dashboards and reports that translate raw operational data into strategic insight for leadership and finance teams.',
    body:
      'AssetStack produces audit-ready outputs aligned to ISO 55000 and IPWEA reporting standards.',
    capabilities: [
      'Portfolio-level KPIs and health indices',
      'Replacement forecasts and capital planning views',
      'Compliance and audit reports',
      'Custom dashboards by role and persona',
      'Scheduled and on-demand exports',
    ],
    outcome:
      'A clear line of sight from field condition to board-level decisions.',
    tone: 'sky',
    icon: BarChart3,
  },
  {
    badge: 'Module',
    title: 'Finance Hub & Funding Optimiser',
    intro:
      'A finance-grade view of your asset portfolio with an AI-driven optimiser that allocates capital where it reduces the most risk per dollar.',
    body:
      'AssetStack connects condition, risk and replacement cost data into a single financial layer, then runs scenario optimisation to maximise outcomes within constrained budgets.',
    capabilities: [
      'Portfolio valuation and depreciation tracking',
      'Capital plan and replacement forecasts',
      'Funding optimiser across asset classes and scenarios',
      'Risk-adjusted ROI on every dollar of maintenance spend',
      'Board-ready financial reporting and scenario comparison',
    ],
    outcome:
      'Defensible investment decisions that deliver more reliability per dollar.',
    tone: 'emerald',
    icon: Banknote,
  },
];

function PreviewIllustration({ Icon, label, accent, soft }) {
  return (
    <>
      {/* Window frame */}
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

      {/* Large brand icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center"
          style={{ background: soft, color: accent }}
        >
          <Icon className="w-14 h-14" strokeWidth={1.4} />
        </div>
      </div>

      {/* Faux data rows */}
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

export default function ProductModules() {
  return (
    <section id="modules" className="bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 pt-20 lg:pt-28">
        <div className="max-w-3xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary mb-4">
            Platform modules
          </p>
          <h2
            className="font-normal text-slate-900 leading-[1.05] tracking-[-0.01em]"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(2rem, 4.6vw, 3.6rem)',
            }}
          >
            Modular Infrastructure<br />Intelligence Platform.
          </h2>
          <p className="mt-6 text-slate-600 text-[15px] md:text-[17px] leading-relaxed">
            AssetStack's modular architecture allows organisations to deploy
            only the capabilities they need while seamlessly expanding as
            infrastructure systems grow.
          </p>
        </div>
      </div>

      {MODULES.map((m, i) => {
        const CustomPreview = CUSTOM_PREVIEWS[m.title];
        return (
          <ProductModule
            key={m.title}
            index={i + 1}
            badge={m.badge}
            title={m.title}
            intro={m.intro}
            body={m.body}
            capabilities={m.capabilities}
            outcome={m.outcome}
            reverse={i % 2 === 1}
            preview={
              CustomPreview ? (
                <CustomPreview />
              ) : (
                <ProductModulePreview tone={m.tone}>
                  {({ accent, soft }) => (
                    <PreviewIllustration
                      Icon={m.icon}
                      label={m.title}
                      accent={accent}
                      soft={soft}
                    />
                  )}
                </ProductModulePreview>
              )
            }
          />
        );
      })}
    </section>
  );
}