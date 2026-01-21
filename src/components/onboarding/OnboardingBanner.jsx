import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function OnboardingBanner() {
  const { data: progress = [] } = useQuery({
    queryKey: ['onboardingProgress'],
    queryFn: () => base44.entities.OnboardingProgress.list('-created_date', 1),
  });

  const currentProgress = progress[0];

  // Don't show if no progress or completed
  if (!currentProgress || currentProgress.onboarding_completed) {
    return null;
  }

  // Count completed steps
  const steps = [
    'step_equipment_added',
    'step_sensors_configured', 
    'step_sensor_data_received',
    'step_technicians_added',
    'step_spare_parts_added',
    'step_first_prediction_run'
  ];

  const completedCount = steps.filter(s => currentProgress[s]).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-4 mb-6"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Complete Your Setup</h3>
            <span className="text-sm text-white/80">{completedCount}/{steps.length} steps</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-white/20" />
        </div>

        <Link to={createPageUrl('Onboarding')}>
          <Button variant="secondary" size="sm" className="bg-white text-indigo-600 hover:bg-white/90">
            Continue Setup
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}