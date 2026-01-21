import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Radio, Users, Package, Brain, CheckCircle, Circle,
  ArrowRight, ChevronRight, Sparkles, Upload, Play, Rocket
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const ONBOARDING_STEPS = [
  {
    id: 'equipment',
    title: 'Add Your Equipment',
    description: 'Register the equipment and assets you want to monitor',
    icon: Cpu,
    field: 'step_equipment_added',
    link: 'Equipment',
    linkText: 'Add Equipment'
  },
  {
    id: 'sensors',
    title: 'Configure Sensors',
    description: 'Set up sensors to collect data from your equipment',
    icon: Radio,
    field: 'step_sensors_configured',
    link: 'SensorIntegration',
    linkText: 'Configure Sensors'
  },
  {
    id: 'data',
    title: 'Ingest Sensor Data',
    description: 'Import historical data or connect your IoT platform',
    icon: Upload,
    field: 'step_sensor_data_received',
    link: 'SensorIntegration',
    linkText: 'Import Data'
  },
  {
    id: 'technicians',
    title: 'Add Technicians',
    description: 'Add your maintenance team for task assignments',
    icon: Users,
    field: 'step_technicians_added',
    link: 'Maintenance',
    linkText: 'Add Technicians'
  },
  {
    id: 'parts',
    title: 'Add Spare Parts',
    description: 'Register spare parts inventory for maintenance planning',
    icon: Package,
    field: 'step_spare_parts_added',
    link: 'Analytics',
    linkText: 'Add Parts'
  },
  {
    id: 'prediction',
    title: 'Run AI Prediction',
    description: 'Let AI analyze your data and generate insights',
    icon: Brain,
    field: 'step_first_prediction_run',
    link: 'Predictions',
    linkText: 'Run Predictions'
  }
];

export default function Onboarding() {
  const [companyName, setCompanyName] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: progress = [], isLoading } = useQuery({
    queryKey: ['onboardingProgress'],
    queryFn: () => base44.entities.OnboardingProgress.list('-created_date', 1),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 1),
  });

  const { data: sensorConfigs = [] } = useQuery({
    queryKey: ['sensorConfigs'],
    queryFn: () => base44.entities.SensorConfiguration.list('-created_date', 1),
  });

  const { data: readings = [] } = useQuery({
    queryKey: ['readings'],
    queryFn: () => base44.entities.SensorReading.list('-created_date', 1),
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => base44.entities.Technician.list('-created_date', 1),
  });

  const { data: spareParts = [] } = useQuery({
    queryKey: ['spareParts'],
    queryFn: () => base44.entities.SparePart.list('-created_date', 1),
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.PredictionLog.list('-created_date', 1),
  });

  const createProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.OnboardingProgress.create(data),
    onSuccess: () => queryClient.invalidateQueries(['onboardingProgress']),
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.OnboardingProgress.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['onboardingProgress']),
  });

  const currentProgress = progress[0];

  // Auto-update progress based on actual data
  useEffect(() => {
    if (!currentProgress) return;

    const updates = {};
    if (equipment.length > 0 && !currentProgress.step_equipment_added) {
      updates.step_equipment_added = true;
    }
    if (sensorConfigs.length > 0 && !currentProgress.step_sensors_configured) {
      updates.step_sensors_configured = true;
    }
    if (readings.length > 0 && !currentProgress.step_sensor_data_received) {
      updates.step_sensor_data_received = true;
    }
    if (technicians.length > 0 && !currentProgress.step_technicians_added) {
      updates.step_technicians_added = true;
    }
    if (spareParts.length > 0 && !currentProgress.step_spare_parts_added) {
      updates.step_spare_parts_added = true;
    }
    if (predictions.length > 0 && !currentProgress.step_first_prediction_run) {
      updates.step_first_prediction_run = true;
    }

    if (Object.keys(updates).length > 0) {
      const allComplete = 
        (updates.step_equipment_added || currentProgress.step_equipment_added) &&
        (updates.step_sensors_configured || currentProgress.step_sensors_configured) &&
        (updates.step_sensor_data_received || currentProgress.step_sensor_data_received) &&
        (updates.step_technicians_added || currentProgress.step_technicians_added) &&
        (updates.step_spare_parts_added || currentProgress.step_spare_parts_added) &&
        (updates.step_first_prediction_run || currentProgress.step_first_prediction_run);

      if (allComplete) {
        updates.onboarding_completed = true;
        updates.onboarding_completed_at = new Date().toISOString();
      }

      updateProgressMutation.mutate({ id: currentProgress.id, data: updates });
    }
  }, [equipment, sensorConfigs, readings, technicians, spareParts, predictions, currentProgress]);

  const handleStartOnboarding = async () => {
    if (!companyName.trim()) return;
    setIsStarting(true);
    await createProgressMutation.mutateAsync({
      company_name: companyName.trim()
    });
    setIsStarting(false);
  };

  const getStepStatus = (step) => {
    if (!currentProgress) return 'pending';
    return currentProgress[step.field] ? 'complete' : 'pending';
  };

  const completedSteps = currentProgress 
    ? ONBOARDING_STEPS.filter(s => currentProgress[s.field]).length 
    : 0;
  const progressPercent = (completedSteps / ONBOARDING_STEPS.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Welcome screen if no progress exists
  if (!currentProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to PredictAI</h1>
            <p className="text-slate-600">
              Let's get your predictive maintenance platform set up in just a few steps
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl">
            <div className="space-y-4">
              <div>
                <Label className="text-slate-700">Company Name</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  className="mt-2 bg-white border-slate-200"
                />
              </div>

              <Button
                onClick={handleStartOnboarding}
                disabled={!companyName.trim() || isStarting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg"
              >
                {isStarting ? (
                  'Setting up...'
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-medium text-slate-900 mb-4">What you'll set up:</h4>
              <div className="grid grid-cols-2 gap-3">
                {ONBOARDING_STEPS.slice(0, 4).map(step => (
                  <div key={step.id} className="flex items-center gap-2 text-sm text-slate-600">
                    <step.icon className="w-4 h-4 text-indigo-500" />
                    {step.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Completed state
  if (currentProgress.onboarding_completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Setup Complete!</h1>
          <p className="text-slate-600 mb-8">
            Congratulations, {currentProgress.company_name}! Your predictive maintenance platform is ready to go.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Dashboard')}>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Rocket className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            <Link to={createPageUrl('Predictions')}>
              <Button variant="outline" className="border-slate-200">
                <Brain className="w-4 h-4 mr-2" />
                View Predictions
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Onboarding progress screen
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {currentProgress.company_name}!
          </h1>
          <p className="text-slate-600 mt-1">
            Complete these steps to get the most out of your predictive maintenance platform
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Setup Progress</h3>
              <p className="text-sm text-slate-500">{completedSteps} of {ONBOARDING_STEPS.length} steps completed</p>
            </div>
            <span className="text-2xl font-bold text-indigo-600">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {ONBOARDING_STEPS.map((step, idx) => {
            const status = getStepStatus(step);
            const isComplete = status === 'complete';
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-white rounded-xl border p-6 ${
                  isComplete ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isComplete ? 'bg-emerald-100' : 'bg-slate-100'
                  }`}>
                    {isComplete ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <Icon className="w-6 h-6 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className={`font-semibold ${isComplete ? 'text-emerald-900' : 'text-slate-900'}`}>
                        {step.title}
                      </h3>
                      {isComplete && (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Complete
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                  </div>

                  <Link to={createPageUrl(step.link)}>
                    <Button
                      variant={isComplete ? 'ghost' : 'default'}
                      className={isComplete ? 'text-slate-500' : 'bg-indigo-600 hover:bg-indigo-700'}
                    >
                      {isComplete ? 'View' : step.linkText}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Skip option */}
        <div className="mt-8 text-center">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" className="text-slate-500">
              Skip setup and explore dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}