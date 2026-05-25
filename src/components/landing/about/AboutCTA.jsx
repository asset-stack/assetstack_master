import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function AboutCTA() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-slate-900 text-white px-8 py-16 md:px-16 md:py-24 overflow-hidden relative"
        >
          <div aria-hidden className="absolute inset-0 opacity-50" style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.4), transparent 50%), radial-gradient(circle at 80% 80%, hsl(214 100% 70% / 0.3), transparent 50%)',
          }} />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-balance">
              Want to see what we've built — <span className="font-serif italic font-medium text-blue-200">on your data?</span>
            </h2>
            <p className="mt-5 text-[15px] md:text-[16px] text-slate-300 leading-[1.6] max-w-xl">
              We run tailored working sessions with infrastructure teams. No platform access until you're ready. No procurement before you've seen the value.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/Contact">
                <Button size="lg" className="bg-white hover:bg-slate-100 text-slate-900 elevation-2 h-12 px-7 text-[14px] font-semibold rounded-lg">
                  Book a working session <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </a>
              <a href="/Customers">
                <Button size="lg" variant="outline" className="h-12 px-7 text-[14px] font-semibold border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 rounded-lg backdrop-blur">
                  See our customers
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}