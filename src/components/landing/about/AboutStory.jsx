import React from 'react';
import { motion } from 'framer-motion';

export default function AboutStory() {
  return (
    <section className="py-24 md:py-36 bg-white border-t border-slate-100">
      <div className="max-w-[1100px] mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20 items-start">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Our story</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-balance">
              We started where the <span className="font-serif italic font-medium text-primary">spreadsheets</span> end.
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5 text-[15px] md:text-[16px] text-slate-600 leading-[1.7]"
          >
            <p>
              AssetStack was founded by engineers, asset managers and data scientists who lived through the spreadsheet era — the late-night register cleans, the surprise CAPEX deferrals, the unmaintained assets that always became someone else's problem.
            </p>
            <p>
              We built the platform we wished we'd had: one place to see every asset, its condition, its cost trajectory, and the work needed to keep it running. No fragmented modules. No procurement gauntlets. Just a clear, defensible operating picture for the people who maintain the world.
            </p>
            <p>
              We are headquartered in Australia, work alongside councils and operators across ANZ, and partner with infrastructure teams who treat their portfolios as long-term obligations rather than balance-sheet entries.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}