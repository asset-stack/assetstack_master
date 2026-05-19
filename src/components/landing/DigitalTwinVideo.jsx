import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';

// Embedded Digital Twin video preview block — matches sister site MP4 embed.
export default function DigitalTwinVideo() {
  return (
    <section className="bg-slate-50 py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="relative aspect-video rounded-2xl overflow-hidden elevation-3 bg-slate-900"
        >
          <iframe
            src="https://drive.google.com/file/d/1y_iHAThGp10hF8uzWI0GlBOhDBleFrLj/preview"
            title="Digital Twin Demo"
            allow="autoplay"
            className="w-full h-full"
          />
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-xs font-medium pointer-events-none">
            <PlayCircle className="w-3.5 h-3.5" /> Digital Twin Demo
          </div>
        </motion.div>
      </div>
    </section>
  );
}