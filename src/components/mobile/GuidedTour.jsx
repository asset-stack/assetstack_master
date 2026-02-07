import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles, LayoutDashboard, Cpu, Wrench, Brain } from 'lucide-react';
import { Button } from "@/components/ui/button";

const TOUR_STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to AssetStack",
    description: "Your AI-powered asset management platform. Let's take a quick tour of the key features.",
    color: "from-indigo-500 to-violet-500"
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Monitor your fleet health, active alerts, and equipment status in real-time with live updates.",
    color: "from-blue-500 to-indigo-500"
  },
  {
    icon: Cpu,
    title: "Equipment & Sensors",
    description: "Track all your assets, configure IoT sensors, and view real-time readings and health scores.",
    color: "from-emerald-500 to-teal-500"
  },
  {
    icon: Wrench,
    title: "Maintenance",
    description: "Manage work orders, run checklists on mobile, and plan preventive maintenance schedules.",
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: Brain,
    title: "AI Predictions",
    description: "Get AI-powered failure predictions, anomaly detection, and smart maintenance recommendations.",
    color: "from-purple-500 to-pink-500"
  }
];

export default function GuidedTour({ onComplete }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const tourSeen = localStorage.getItem('assetstack_tour_seen');
    if (!tourSeen) {
      setVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem('assetstack_tour_seen', 'true');
    onComplete?.();
  };

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/60 flex items-end sm:items-center justify-center p-4"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
          {/* Gradient header */}
          <div className={`bg-gradient-to-r ${current.color} p-6 text-center`}>
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">{current.title}</h3>
          </div>

          {/* Content */}
          <div className="p-5">
            <p className="text-sm text-slate-600 text-center leading-relaxed mb-5">
              {current.description}
            </p>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-1.5 mb-5">
              {TOUR_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === step ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="flex-1 text-slate-500"
              >
                Skip
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {step === TOUR_STEPS.length - 1 ? "Get Started" : "Next"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}