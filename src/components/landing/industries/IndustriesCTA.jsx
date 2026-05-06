import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function IndustriesCTA() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-[1100px] mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-slate-900 text-white px-8 py-14 md:px-14 md:py-20 overflow-hidden text-center"
        >
          <div aria-hidden className="absolute inset-0 opacity-50" style={{
            backgroundImage: 'radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.4), transparent 50%), radial-gradient(circle at 70% 70%, hsl(214 100% 70% / 0.3), transparent 50%)',
          }} />

          <div className="relative">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] leading-[1.05] text-balance max-w-2xl mx-auto">
              See how AssetStack works for{' '}
              <span className="font-serif italic font-medium text-blue-200">your organisation.</span>
            </h2>
            <p className="mt-5 text-[15px] md:text-[17px] text-slate-300 leading-[1.55] max-w-xl mx-auto text-pretty">
              Discover how AssetStack helps asset owners and infrastructure operators monitor assets, predict failures and optimise maintenance operations.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Link to="/Landing#tour">
                <Button size="lg" variant="outline" className="h-12 px-7 text-[14px] font-semibold border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 rounded-lg backdrop-blur">
                  Explore the Platform
                </Button>
              </Link>
              <Link to="/CommandCenter">
                <Button size="lg" className="bg-white hover:bg-slate-100 text-slate-900 elevation-2 h-12 px-7 text-[14px] font-semibold rounded-lg">
                  Book a demo <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}