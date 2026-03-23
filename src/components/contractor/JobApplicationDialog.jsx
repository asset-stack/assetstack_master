import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, CheckCircle2, MapPin, DollarSign, Clock } from 'lucide-react';

export default function JobApplicationDialog({ open, onOpenChange, job, technician }) {
  const queryClient = useQueryClient();
  const [coverMessage, setCoverMessage] = useState('');
  const [proposedRate, setProposedRate] = useState(job?.hourly_rate || '');
  const [availableDate, setAvailableDate] = useState('');
  const [success, setSuccess] = useState(false);

  const applyMutation = useMutation({
    mutationFn: (data) => base44.entities.JobApplication.create(data),
    onSuccess: async () => {
      // Increment applications count on the job
      await base44.entities.Job.update(job.id, { 
        applications_count: (job.applications_count || 0) + 1 
      });
      queryClient.invalidateQueries({ queryKey: ['publicJobs'] });
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      setSuccess(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    applyMutation.mutate({
      job_id: job.id,
      job_title: job.title,
      contractor_id: technician.id,
      contractor_name: technician.name,
      contractor_email: technician.email,
      cover_message: coverMessage,
      proposed_rate: proposedRate ? parseFloat(proposedRate) : null,
      available_start_date: availableDate || null,
      status: 'pending',
    });
  };

  const handleClose = () => {
    setCoverMessage('');
    setProposedRate(job?.hourly_rate || '');
    setAvailableDate('');
    setSuccess(false);
    onOpenChange(false);
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-white">
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Application Submitted!</h3>
            <p className="text-sm text-slate-500 mb-4">
              Your application for "{job.title}" has been sent. You'll be notified when the employer responds.
            </p>
            <Button onClick={handleClose} className="bg-indigo-600 hover:bg-indigo-700">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>Apply for Job</DialogTitle>
        </DialogHeader>

        {/* Job Summary */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-slate-900 mb-1">{job?.title}</h4>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            {job?.location_name && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location_name}</span>}
            {job?.estimated_hours && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.estimated_hours}h</span>}
            {job?.hourly_rate && <span className="flex items-center gap-1 text-emerald-600"><DollarSign className="w-3 h-3" />${job.hourly_rate}/hr</span>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Cover Message</Label>
            <Textarea
              value={coverMessage}
              onChange={e => setCoverMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you're a good fit for this job..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Your Proposed Rate ($/hr)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={proposedRate}
                onChange={e => setProposedRate(e.target.value)}
                placeholder="75.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Available Start Date</Label>
              <Input
                type="date"
                value={availableDate}
                onChange={e => setAvailableDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              disabled={applyMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {applyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
              Submit Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}