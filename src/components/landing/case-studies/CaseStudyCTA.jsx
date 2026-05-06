import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export default function CaseStudyCTA() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-slate-900 text-white px-8 py-14 md:px-16 md:py-20 overflow-hidden"
        >
          <div aria-hidden className="absolute inset-0 opacity-50" style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.4), transparent 50%), radial-gradient(circle at 80% 80%, hsl(214 100% 70% / 0.3), transparent 50%)',
          }} />
          <div className="relative grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200">For infrastructure operators</span>
              <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-balance">
                See how AssetStack works for{' '}
                <span className="font-serif italic font-medium text-blue-200">your network.</span>
              </h2>
              <p className="mt-4 text-[15px] text-slate-300 leading-[1.6] max-w-xl">
                Councils, utilities and infrastructure operators use AssetStack to monitor assets, predict failures and prove every avoided breakdown.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 md:items-stretch">
              <Link to="/CommandCenter">
                <Button size="lg" className="w-full bg-white hover:bg-slate-100 text-slate-900 h-12 px-7 text-[14px] font-semibold rounded-lg">
                  Explore the platform <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <a href="/Landing#tour">
                <Button size="lg" variant="outline" className="w-full h-12 px-7 text-[14px] font-semibold border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 rounded-lg backdrop-blur">
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-white" /> Book a demo
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}