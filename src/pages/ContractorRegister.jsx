import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Building2, User, Mail, Phone, FileText, Wrench, DollarSign, CheckCircle2, Loader2, AlertCircle, Cpu } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ContractorRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    tax_id: '',
    bio: '',
    skills: '',
    equipment_specializations: '',
    hourly_rate: '',
    certification_level: 'intermediate',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      ...form,
      skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      equipment_specializations: form.equipment_specializations ? form.equipment_specializations.split(',').map(s => s.trim()).filter(Boolean) : [],
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : 0,
    };

    const response = await base44.functions.invoke('registerContractor', payload);
    
    if (response.data?.success) {
      setSuccess(true);
    } else {
      setError(response.data?.error || 'Registration failed. Please try again.');
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Created!</h2>
          <p className="text-slate-600 mb-4">
            Your contractor profile has been created. You'll receive a login invitation at <strong>{form.email}</strong> shortly.
          </p>
          <p className="text-sm text-slate-500">
            Organisations can now find and invite you to their teams by searching your email address.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <Cpu className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Join AssetStack</h1>
          <p className="text-slate-500 mt-2">Create your contractor profile so organisations can find and invite you</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6"
        >
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" /> Company Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={form.company_name}
                  onChange={e => setForm({ ...form, company_name: e.target.value })}
                  placeholder="ABC Maintenance Ltd"
                />
              </div>
              <div>
                <Label>Tax ID / ABN</Label>
                <Input
                  value={form.tax_id}
                  onChange={e => setForm({ ...form, tax_id: e.target.value })}
                  placeholder="12-345-678-901"
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-500" /> Professional Details
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Bio / Summary</Label>
                <Textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Brief summary of your experience and expertise..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Certification Level</Label>
                  <Select value={form.certification_level} onValueChange={v => setForm({ ...form, certification_level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                      <SelectItem value="master">Master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Hourly Rate ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.hourly_rate}
                    onChange={e => setForm({ ...form, hourly_rate: e.target.value })}
                    placeholder="75.00"
                  />
                </div>
              </div>
              <div>
                <Label>Skills (comma-separated)</Label>
                <Input
                  value={form.skills}
                  onChange={e => setForm({ ...form, skills: e.target.value })}
                  placeholder="HVAC, Electrical, Plumbing, Welding"
                />
              </div>
              <div>
                <Label>Equipment Specializations (comma-separated)</Label>
                <Input
                  value={form.equipment_specializations}
                  onChange={e => setForm({ ...form, equipment_specializations: e.target.value })}
                  placeholder="Pump, Compressor, HVAC, Generator"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-base"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Building2 className="w-4 h-4 mr-2" />}
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </Button>

          <p className="text-xs text-slate-400 text-center">
            By registering, you create a public contractor profile. Organisations can invite you to their teams.
          </p>
        </motion.form>
      </div>
    </div>
  );
}