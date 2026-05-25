import React from 'react';
import { motion } from 'framer-motion';

export default function CustomersQuote() {
  return (
    <section className="py-24 md:py-32 bg-slate-50 border-t border-slate-100">
      <div className="max-w-[1000px] mx-auto px-5 md:px-8">
        <motion.blockquote
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p
            className="text-2xl md:text-4xl lg:text-5xl text-slate-900 leading-[1.2] tracking-[-0.02em] text-balance"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            <span className="text-primary">"</span>
            We replaced three systems and a folder of spreadsheets in six weeks. The first time the executive saw a defensible 10-year picture of our portfolio, the conversation completely changed.
            <span className="text-primary">"</span>
          </p>
          <footer className="mt-8 text-[13px] text-slate-500">
            <span className="font-semibold text-slate-900">Director of Assets</span>
            <span className="opacity-50 mx-2">·</span>
            <span>Australian local government</span>
          </footer>
        </motion.blockquote>
      </div>
    </section>
  );
}