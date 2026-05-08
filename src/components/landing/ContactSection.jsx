import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Check, Building2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', org: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.email) return;
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-white border-t border-slate-100 scroll-mt-24">
      <div className="max-w-[1100px] mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-start">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Get in touch</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-balance">
              Book a working <span className="font-serif italic font-medium text-primary">demo.</span>
            </h2>
            <p className="mt-4 text-[15px] md:text-base text-slate-600 leading-relaxed max-w-md">
              Tell us about your portfolio. We'll run a tailored session — no platform access until you're ready.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-[13px] text-slate-700">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span>hello@assetstack.com</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-slate-700">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <span>Australian-built · Pilot engagements available</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-slate-700">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span>Onboarding & data migration support included</span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50/50 to-white p-6 md:p-8 elevation-2"
          >
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Thanks — we'll be in touch.</h3>
                <p className="mt-2 text-[13px] text-slate-600">A member of our team will reply within one business day.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-semibold text-slate-700 mb-1.5 block">Name</label>
                    <Input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-slate-700 mb-1.5 block">Work email</label>
                    <Input type="email" required value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="jane@org.com" />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-700 mb-1.5 block">Organisation</label>
                  <Input value={form.org} onChange={(event) => update('org', event.target.value)} placeholder="Council, operator, asset owner…" />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-700 mb-1.5 block">What would you like to see?</label>
                  <Textarea
                    rows={4}
                    value={form.message}
                    onChange={(event) => update('message', event.target.value)}
                    placeholder="Asset count, sectors, current pain points…"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold elevation-1">
                  Request a demo <Send className="w-3.5 h-3.5 ml-1.5" />
                </Button>
                <p className="text-[10px] text-slate-400 text-center">
                  We'll only use your details to contact you about AssetStack.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}