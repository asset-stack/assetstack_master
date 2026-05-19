import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const INDUSTRIES = [
  { name: 'Government & Local Councils', img: 'https://media.base44.com/images/public/69c1f3c7f9a453fedbd46eba/09502863f_Council.jpg' },
  { name: 'Healthcare & Aged Care', img: 'https://media.base44.com/images/public/69c1f3c7f9a453fedbd46eba/0d2847fe7_Hospital.jpg' },
  { name: 'Transport & Infrastructure', img: 'https://media.base44.com/images/public/69c1f3c7f9a453fedbd46eba/a6f6e876a_Trasnsport.jpg' },
  { name: 'Utilities, Energy & Resources', img: 'https://media.base44.com/images/public/69c1f3c7f9a453fedbd46eba/2226b7e38_Utilities.jpg' },
  { name: 'Property & Asset Portfolio Managers', img: 'https://media.base44.com/images/public/69c1f3c7f9a453fedbd46eba/081792895_Property.jpg' },
  { name: 'Education & Campus Infrastructure', img: 'https://media.base44.com/images/public/69c1f3c7f9a453fedbd46eba/799d8de58_Education.jpg' },
];

export default function SisterIndustries() {
  return (
    <section id="industries" className="bg-slate-50 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-600 mb-3">Industries</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Proven Across Industries Where Failure Is Not an Option
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {INDUSTRIES.map((ind, i) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
            >
              <Link
                to="/Industries"
                className="group block relative aspect-[4/3] rounded-xl overflow-hidden elevation-2 hover-lift"
              >
                <img
                  src={ind.img}
                  alt={ind.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <h3 className="text-white font-semibold text-base md:text-lg leading-tight">
                    {ind.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/Industries"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
          >
            View All Industries <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}