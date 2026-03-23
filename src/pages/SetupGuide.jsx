import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Radio, Users, Brain, BarChart3, Wrench, Shield, MapPin,
  ArrowRight, ArrowLeft, CheckCircle, Sparkles, Zap, Clock,
  FileText, MessageSquare, Briefcase, TrendingDown, Box,
  ChevronRight, Rocket, Globe, Database, Upload, Settings
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import SetupFeatureCard from '@/components/setup-guide/SetupFeatureCard';
import SetupStepCard from '@/components/setup-guide/SetupStepCard';
import SetupIntegrationCard from '@/components/setup-guide/SetupIntegrationCard';

const WIZARD_PAGES = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'features', title: 'Features' },
  { id: 'setup', title: 'Getting Started' },
  { id: 'integrations', title: 'Data Sources' },
  { id: 'ready', title: 'Ready!' },
];

export default function SetupGuide() {
  const [currentPage, setCurrentPage] = useState(0);

  const goNext = () => setCurrentPage(p => Math.min(p + 1, WIZARD_PAGES.length - 1));
  const goPrev = () => setCurrentPage(p => Math.max(p - 1, 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {WIZARD_PAGES.map((page, i) => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(i)}
              className="flex items-center gap-1"
            >
              <div className={`h-2.5 rounded-full transition-all duration-300 ${
                i === currentPage ? 'w-8 bg-indigo-600' : i < currentPage ? 'w-2.5 bg-indigo-400' : 'w-2.5 bg-slate-300'
              }`} />
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {currentPage === 0 && <WelcomePage key="welcome" />}
          {currentPage === 1 && <FeaturesPage key="features" />}
          {currentPage === 2 && <GettingStartedPage key="setup" />}
          {currentPage === 3 && <IntegrationsPage key="integrations" />}
          {currentPage === 4 && <ReadyPage key="ready" />}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentPage === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          <span className="text-sm text-slate-500">
            {currentPage + 1} of {WIZARD_PAGES.length}
          </span>

          {currentPage < WIZARD_PAGES.length - 1 ? (
            <Button onClick={goNext} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Link to={createPageUrl('Onboarding')}>
              <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                Start Setup <Rocket className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center py-8 lg:py-16"
    >
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/30">
        <Sparkles className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
        Welcome to <span className="text-indigo-600">AssetStack</span>
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
        The all-in-one asset management platform that combines AI-powered predictive maintenance, 
        digital twins, team collaboration, and financial tracking — all in one place.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12">
        {[
          { icon: Clock, label: 'Set up in minutes', desc: 'No complex installation needed' },
          { icon: Zap, label: 'AI-powered insights', desc: 'Predictive maintenance built in' },
          { icon: Globe, label: 'Works everywhere', desc: 'Desktop, tablet & mobile ready' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
              <item.icon className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{item.label}</h3>
            <p className="text-sm text-slate-500">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function FeaturesPage() {
  const features = [
    { icon: Cpu, title: 'Equipment Tracking', desc: 'Register and monitor all your assets with health scores, risk levels, and real-time status updates.', color: 'bg-blue-50 text-blue-600' },
    { icon: Brain, title: 'AI Predictions', desc: 'Machine learning models predict equipment failures before they happen, saving time and money.', color: 'bg-purple-50 text-purple-600' },
    { icon: Box, title: 'Digital Twin', desc: 'Interactive floor plans with equipment hotspots, anomaly detection, and visual asset mapping.', color: 'bg-emerald-50 text-emerald-600' },
    { icon: Wrench, title: 'Work Orders', desc: 'Create, assign, and track maintenance work orders with checklists, media, and team chat.', color: 'bg-orange-50 text-orange-600' },
    { icon: Radio, title: 'Sensor Integration', desc: 'Connect IoT sensors or import data via CSV/API to monitor equipment conditions in real time.', color: 'bg-rose-50 text-rose-600' },
    { icon: Users, title: 'Team Management', desc: 'Manage technicians, contractors, assign roles, track performance and send kudos.', color: 'bg-cyan-50 text-cyan-600' },
    { icon: MessageSquare, title: 'AssetMind AI', desc: 'Chat with an AI assistant that knows your entire asset portfolio, documentation, and maintenance history.', color: 'bg-indigo-50 text-indigo-600' },
    { icon: TrendingDown, title: 'Depreciation', desc: 'Track asset depreciation with multiple methods — straight line, declining balance, and more.', color: 'bg-amber-50 text-amber-600' },
    { icon: BarChart3, title: 'Analytics & Reports', desc: 'Dashboards, cost analysis, root cause analysis, and exportable reports for stakeholders.', color: 'bg-teal-50 text-teal-600' },
    { icon: MapPin, title: 'Location Management', desc: 'Organise assets by location, track site health, and manage multi-site operations.', color: 'bg-pink-50 text-pink-600' },
    { icon: Briefcase, title: 'Contractor Portal', desc: 'Public job board, contractor registration, applications, and team invitations.', color: 'bg-violet-50 text-violet-600' },
    { icon: Shield, title: 'Roles & Permissions', desc: 'Granular access control — define who can view, create, edit, and delete across every module.', color: 'bg-slate-100 text-slate-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Everything You Need</h2>
        <p className="text-slate-600">A complete toolkit for modern asset management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <SetupFeatureCard key={i} feature={f} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

function GettingStartedPage() {
  const steps = [
    { number: 1, title: 'Add Your Locations', desc: 'Register your sites, buildings, and facilities. Add addresses, contacts, and notes for each location.', time: '2 mins', link: 'Locations' },
    { number: 2, title: 'Register Equipment', desc: 'Add your assets — motors, pumps, HVAC, bridges, whatever you manage. Set type, location, and specifications.', time: '5 mins', link: 'Equipment' },
    { number: 3, title: 'Set Up Your Team', desc: 'Add technicians and assign skills, certifications, and shifts. Invite contractors through the portal.', time: '3 mins', link: 'TeamDirectory' },
    { number: 4, title: 'Connect Sensors (Optional)', desc: 'Import sensor data via CSV or connect your IoT platform via API. The system starts learning immediately.', time: '5 mins', link: 'SensorIntegration' },
    { number: 5, title: 'Run AI Predictions', desc: 'Let the AI analyse your data and generate failure predictions, maintenance recommendations, and risk scores.', time: '1 min', link: 'Predictions' },
    { number: 6, title: 'Create Maintenance Plans', desc: 'Set up recurring maintenance schedules — time-based, usage-based, or condition-based triggers.', time: '5 mins', link: 'MaintenancePlanning' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Up and Running in Minutes</h2>
        <p className="text-slate-600">Six simple steps to a fully operational platform</p>
        <div className="inline-flex items-center gap-2 mt-3 bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-2 rounded-full">
          <Clock className="w-4 h-4" />
          Average setup time: ~20 minutes
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <SetupStepCard key={i} step={step} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

function IntegrationsPage() {
  const integrations = [
    { icon: Database, title: 'Power BI', desc: 'Embed interactive Power BI dashboards directly, or pull data via the REST API.', category: 'Analytics' },
    { icon: Database, title: 'SQL Databases', desc: 'Connect to SQL Server, PostgreSQL, MySQL, or Azure SQL for live data sync.', category: 'Database' },
    { icon: FileText, title: 'SharePoint & OneDrive', desc: 'Pull documents, maintenance manuals, and asset records from your SharePoint.', category: 'Documents' },
    { icon: FileText, title: 'Google Sheets', desc: 'Import asset registers, inventory lists, or schedule data from spreadsheets.', category: 'Spreadsheets' },
    { icon: Database, title: 'Google BigQuery', desc: 'Connect to BigQuery for large-scale sensor data and analytics.', category: 'Analytics' },
    { icon: Upload, title: 'CSV / Excel Import', desc: 'Bulk upload equipment, sensor data, spare parts, and more from files.', category: 'File Import' },
    { icon: Radio, title: 'IoT Platforms', desc: 'Connect any IoT platform via REST API or MQTT for real-time sensor data.', category: 'IoT' },
    { icon: Settings, title: 'ERP / CMMS Systems', desc: 'Integrate with SAP, Maximo, or any system with a REST API.', category: 'Enterprise' },
    { icon: Zap, title: 'Zapier / Make', desc: 'Connect to 5,000+ apps via automation platforms — no coding needed.', category: 'Automation' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Connect Your Data Sources</h2>
        <p className="text-slate-600">Bring in data from anywhere — databases, files, APIs, and IoT platforms</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item, i) => (
          <SetupIntegrationCard key={i} integration={item} index={i} />
        ))}
      </div>

      <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-center">
        <p className="text-indigo-800 font-medium">Don't see your data source?</p>
        <p className="text-sm text-indigo-600 mt-1">
          Custom integrations can be set up via backend functions — just ask and we'll connect it.
        </p>
      </div>
    </motion.div>
  );
}

function ReadyPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center py-8 lg:py-16"
    >
      <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-8">
        <CheckCircle className="w-14 h-14 text-emerald-600" />
      </div>
      <h2 className="text-4xl font-bold text-slate-900 mb-4">You're All Set!</h2>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
        That's everything you need to know. AssetStack is designed to be intuitive — 
        most teams are fully operational within 30 minutes of starting setup.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
        {[
          { label: 'No coding required', desc: 'Point-and-click setup' },
          { label: 'Import existing data', desc: 'CSV, Excel, or API' },
          { label: 'AI learns as you go', desc: 'Gets smarter over time' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">{item.label}</h4>
            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to={createPageUrl('Onboarding')}>
          <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 gap-2">
            <Rocket className="w-5 h-5" /> Begin Setup Now
          </Button>
        </Link>
        <Link to={createPageUrl('Dashboard')}>
          <Button variant="outline" className="h-12 px-8 gap-2">
            Explore the Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}