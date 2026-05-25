import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Radio, Users, Package, Brain, CheckCircle, Circle,
  ArrowRight, ArrowLeft, ChevronRight, Sparkles, Upload, Play, Rocket,
  Building2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IndustrySelector, { INDUSTRIES } from '@/components/onboarding/IndustrySelector';
import AssetQuickAdd from '@/components/onboarding/AssetQuickAdd';

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

const ORG_SIZES = [
  { value: 'small', label: 'Small (1-50 employees)' },
  { value: 'medium', label: 'Medium (51-250 employees)' },
  { value: 'large', label: 'Large (251-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' },
];

export default function Onboarding() {
  const [wizardStep, setWizardStep] = useState(1); // 1: Company, 2: Industry, 3: Assets
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [orgSize, setOrgSize] = useState('');
  const [initialAssets, setInitialAssets] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: progress = [], isLoading } = useQuery({
    queryKey: ['onboardingProgress'],
    queryFn: () => secureEntity('OnboardingProgress').list('-created_date', 1),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => secureEntity('Equipment').list('-created_date', 1),
  });

  const { data: sensorConfigs = [] } = useQuery({
    queryKey: ['sensorConfigs'],
    queryFn: () => secureEntity('SensorConfiguration').list('-created_date', 1),
  });

  const { data: readings = [] } = useQuery({
    queryKey: ['readings'],
    queryFn: () => secureEntity('SensorReading').list('-created_date', 1),
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => base44.entities.Technician.list('-created_date', 1),
  });

  const { data: spareParts = [] } = useQuery({
    queryKey: ['spareParts'],
    queryFn: () => secureEntity('SparePart').list('-created_date', 1),
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => secureEntity('PredictionLog').list('-created_date', 1),
  });

  const createProgressMutation = useMutation({
    mutationFn: (data) => secureEntity('OnboardingProgress').create(data),
    onSuccess: () => queryClient.invalidateQueries(['onboardingProgress']),
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => secureEntity('OnboardingProgress').update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['onboardingProgress']),
  });

  const createEquipmentMutation = useMutation({
    mutationFn: (data) => secureEntity('Equipment').create(data),
    onSuccess: () => queryClient.invalidateQueries(['equipment']),
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

  const handleCompleteOnboarding = async () => {
    if (!companyName.trim() || !industry) return;
    setIsSubmitting(true);

    // Create equipment records for initial assets
    const createdAssetIds = [];
    for (const asset of initialAssets) {
      const created = await createEquipmentMutation.mutateAsync({
        name: asset.name,
        type: asset.type,
        location: asset.location || 'Unassigned',
        status: 'operational',
        health_score: 100,
        risk_level: 'low',
      });
      createdAssetIds.push(created.id);
    }

    // Create onboarding progress
    await createProgressMutation.mutateAsync({
      company_name: companyName.trim(),
      industry,
      organization_size: orgSize,
      initial_assets_added: createdAssetIds,
      step_equipment_added: initialAssets.length > 0,
    });

    setIsSubmitting(false);
  };

  const getStepStatus = (step) => {
    if (!currentProgress) return 'pending';
    return currentProgress[step.field] ? 'complete' : 'pending';
  };

  const completedSteps = currentProgress 
    ? ONBOARDING_STEPS.filter(s => currentProgress[s.field]).length 
    : 0;
  const progressPercent = (completedSteps / ONBOARDING_STEPS.length) * 100;

  const getIndustryName = (id) => {
    const ind = INDUSTRIES.find(i => i.id === id);
    return ind?.name || id;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Multi-step Wizard if no progress exists
  if (!currentProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to AssetStack</h1>
            <p className="text-slate-600">
              The modular asset management platform for any industry
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  wizardStep >= step 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {wizardStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-1 ${
                    wizardStep > step ? 'bg-indigo-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl">
            <AnimatePresence mode="wait">
              {/* Step 1: Company Info */}
              {wizardStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-1">Tell us about your organization</h2>
                    <p className="text-sm text-slate-500">We'll customize your experience based on this</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-700">Organization Name *</Label>
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g., Bunbury City Council"
                        className="mt-2 bg-white border-slate-200"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-700">Organization Size</Label>
                      <Select value={orgSize} onValueChange={setOrgSize}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {ORG_SIZES.map((size) => (
                            <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={() => setWizardStep(2)}
                    disabled={!companyName.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-12"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Industry Selection */}
              {wizardStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-1">Select your industry</h2>
                    <p className="text-sm text-slate-500">We'll suggest relevant asset types and configurations</p>
                  </div>

                  <IndustrySelector selected={industry} onSelect={setIndustry} />

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setWizardStep(1)}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={() => setWizardStep(3)}
                      disabled={!industry}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Initial Assets */}
              {wizardStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-1">Add your initial assets</h2>
                    <p className="text-sm text-slate-500">Start with a few key assets - you can add more later</p>
                  </div>

                  <AssetQuickAdd
                    industry={industry}
                    assets={initialAssets}
                    onAssetsChange={setInitialAssets}
                    isSubmitting={isSubmitting}
                  />

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setWizardStep(2)}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleCompleteOnboarding}
                      disabled={isSubmitting}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isSubmitting ? (
                        'Setting up...'
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          Complete Setup
                        </>
                      )}
                    </Button>
                  </div>

                  {initialAssets.length === 0 && (
                    <button
                      onClick={handleCompleteOnboarding}
                      disabled={isSubmitting}
                      className="w-full text-sm text-slate-500 hover:text-slate-700"
                    >
                      Skip and add assets later →
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Industry Badge Preview */}
          {industry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center"
            >
              <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                <Building2 className="w-4 h-4" />
                Setting up for: <span className="font-medium text-slate-700">{getIndustryName(industry)}</span>
              </span>
            </motion.div>
          )}
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
            Congratulations, {currentProgress.company_name}! Your asset management platform is ready.
          </p>

          {currentProgress.industry && (
            <p className="text-sm text-slate-500 mb-6">
              Configured for: <span className="font-medium">{getIndustryName(currentProgress.industry)}</span>
            </p>
          )}

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
            Complete these steps to get the most out of your asset management platform
          </p>
          {currentProgress.industry && (
            <p className="text-sm text-slate-500 mt-1">
              Industry: <span className="font-medium">{getIndustryName(currentProgress.industry)}</span>
            </p>
          )}
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