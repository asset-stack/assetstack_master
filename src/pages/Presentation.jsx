import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2, Minimize2, Grid3x3 } from 'lucide-react';
import {
  SlideCover, SlideTOC, SlideProblem, SlideSolution, SlideAssetMind, SlideSpeed,
  SlidePredict, SlideScans, SlideWorkOrders, SlideLivePortfolio, SlideFinance,
  SlideSavings, SlideCompliance, SlideSecurity, SlideComparison, SlideVoices,
  SlideImpact, SlideRoadmap, SlideCTA,
} from '../components/presentation/slides';
import {
  SlideAssetRegister, SlideMaintenance, SlideFinanceHub, SlideSensors, SlideFieldOps,
} from '../components/presentation/featureSlides';
import {
  SlideBigStat, SlideBeforeAfter, SlideManifesto, SlideProductMap, SlideThankYou,
} from '../components/presentation/wowSlides';

const CHAPTERS = [
  'Cover',
  'Inside this edition',
  '82%',
  'The reality today',
  'The promise',
  'The AssetStack way',
  'The shift · before & after',
  'The whole product',
  'AssetMind',
  'Onboarding',
  'Asset register & hierarchy',
  'Live portfolio',
  'Sensors & IoT',
  'Predictive maintenance',
  'Digital twin & scans',
  'Maintenance hub',
  'Work orders',
  'Field ops · mobile',
  'Finance hub',
  'Finance & capital plan',
  'Proof of value',
  'Compliance & audit',
  'Security & trust',
  'Why teams choose us',
  'Customer voices',
  'Outcomes & ROI',
  'Get started',
  "Let's talk",
  'Thank you',
];

export default function Presentation() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  const total = CHAPTERS.length;

  const slides = useMemo(() => [
    <SlideCover />,
    <SlideTOC chapters={CHAPTERS.slice(2)} onJump={(i) => setIndex(i + 2)} />,
    <SlideBigStat />,
    <SlideProblem />,
    <SlideManifesto />,
    <SlideSolution />,
    <SlideBeforeAfter />,
    <SlideProductMap />,
    <SlideAssetMind />,
    <SlideSpeed />,
    <SlideAssetRegister />,
    <SlideLivePortfolio />,
    <SlideSensors />,
    <SlidePredict />,
    <SlideScans />,
    <SlideMaintenance />,
    <SlideWorkOrders />,
    <SlideFieldOps />,
    <SlideFinanceHub />,
    <SlideFinance />,
    <SlideSavings />,
    <SlideCompliance />,
    <SlideSecurity />,
    <SlideComparison />,
    <SlideVoices />,
    <SlideImpact />,
    <SlideRoadmap />,
    <SlideCTA />,
    <SlideThankYou />,
  ], []);

  const go = useCallback((next) => {
    setIndex((curr) => {
      const target = Math.max(0, Math.min(total - 1, next));
      setDirection(target > curr ? 1 : -1);
      return target;
    });
  }, [total]);

  useEffect(() => {
    const onKey = (e) => {
      if (showOverview) {
        if (e.key === 'Escape') setShowOverview(false);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        go(index + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === 'Home') {
        go(0);
      } else if (e.key === 'End') {
        go(total - 1);
      } else if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen?.();
      } else if (e.key === 'o' || e.key === 'O') {
        setShowOverview((v) => !v);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, total, go, isFullscreen, showOverview]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Slide stage */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {slides[index]}
          </motion.div>
        </AnimatePresence>

        {/* Edge click zones */}
        <button
          aria-label="Previous slide"
          onClick={() => go(index - 1)}
          className="absolute left-0 top-0 bottom-16 w-[10%] cursor-w-resize"
        />
        <button
          aria-label="Next slide"
          onClick={() => go(index + 1)}
          className="absolute right-0 top-0 bottom-16 w-[10%] cursor-e-resize"
        />

        {/* Side nav arrows */}
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white flex items-center justify-center disabled:opacity-0 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => go(index + 1)}
          disabled={index === total - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white flex items-center justify-center disabled:opacity-0 transition-opacity"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom bar */}
      <div className="h-16 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-4 md:px-6 gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/Landing"
            className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Exit presentation"
          >
            <X className="w-4 h-4" />
          </Link>
          <div className="hidden md:block">
            <div className="text-xs font-bold text-white">{CHAPTERS[index]}</div>
            <div className="text-[10px] text-slate-500 tabular-nums">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Dot navigation */}
        <div className="flex-1 flex items-center justify-center gap-1.5 max-w-2xl overflow-x-auto">
          {CHAPTERS.map((c, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              title={c}
              className={`group relative h-1.5 rounded-full transition-all ${
                i === index ? 'bg-indigo-500 w-8' : 'bg-slate-700 hover:bg-slate-500 w-4'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOverview(true)}
            className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Show overview"
            title="Overview (O)"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Toggle fullscreen"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Overview grid */}
      <AnimatePresence>
        {showOverview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-50 overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-[11px] font-bold tracking-[0.3em] text-indigo-300 uppercase mb-1">
                    Overview
                  </div>
                  <h2 className="text-2xl font-bold text-white">All slides</h2>
                </div>
                <button
                  onClick={() => setShowOverview(false)}
                  className="w-10 h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {CHAPTERS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      go(i);
                      setShowOverview(false);
                    }}
                    className={`group text-left bg-slate-900 rounded-xl overflow-hidden border-2 transition-all ${
                      i === index ? 'border-indigo-500' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="aspect-video bg-slate-900 relative overflow-hidden">
                      <div className="absolute inset-0 origin-top-left scale-[0.2] w-[500%] h-[500%] pointer-events-none">
                        {slides[i]}
                      </div>
                    </div>
                    <div className="p-3 border-t border-slate-800">
                      <div className="text-[10px] font-bold text-slate-500 tabular-nums mb-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="text-sm font-bold text-white truncate">{c}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}