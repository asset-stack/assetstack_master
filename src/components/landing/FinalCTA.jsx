import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 md:p-16 text-white text-center overflow-hidden"
        >
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.2), transparent 50%)',
          }} />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">30-day free trial · No card required</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
              Stop guessing.
              <br />
              Start proving.
            </h2>
            <p className="mt-5 text-white/85 text-lg max-w-xl mx-auto">
              Join the asset teams turning predictions into verified, audited dollar savings.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/CommandCenter">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-7 text-base font-semibold shadow-2xl">
                  Start your free trial <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#demo">
                <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 h-12 px-7 text-base font-semibold">
                  Replay the demo
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}