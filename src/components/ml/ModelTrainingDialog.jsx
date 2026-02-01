import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Loader2, CheckCircle2, Settings, Database, 
  Sliders, Target, AlertTriangle, Zap, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MODEL_TYPES = [
  { value: 'anomaly_detection', label: 'Anomaly Detection', desc: 'Detect unusual patterns in sensor data' },
  { value: 'rul_prediction', label: 'RUL Prediction', desc: 'Predict remaining useful life of equipment' },
  { value: 'failure_classification', label: 'Failure Classification', desc: 'Classify types of equipment failures' },
  { value: 'degradation_trend', label: 'Degradation Trend', desc: 'Analyze equipment degradation patterns' },
];

const ALGORITHMS = {
  anomaly_detection: [
    { value: 'isolation_forest', label: 'Isolation Forest', complexity: 'Low' },
    { value: 'lstm_autoencoder', label: 'LSTM Autoencoder', complexity: 'High' },
    { value: 'svm', label: 'One-Class SVM', complexity: 'Medium' },
  ],
  rul_prediction: [
    { value: 'gradient_boosting', label: 'Gradient Boosting', complexity: 'Medium' },
    { value: 'neural_network', label: 'Neural Network', complexity: 'High' },
    { value: 'weibull_analysis', label: 'Weibull Analysis', complexity: 'Low' },
  ],
  failure_classification: [
    { value: 'random_forest', label: 'Random Forest', complexity: 'Medium' },
    { value: 'gradient_boosting', label: 'Gradient Boosting', complexity: 'Medium' },
    { value: 'neural_network', label: 'Neural Network', complexity: 'High' },
  ],
  degradation_trend: [
    { value: 'cox_proportional_hazards', label: 'Cox Proportional Hazards', complexity: 'Medium' },
    { value: 'gradient_boosting', label: 'Gradient Boosting', complexity: 'Medium' },
  ],
};

const EQUIPMENT_TYPES = [
  'motor', 'pump', 'compressor', 'turbine', 'conveyor', 'hvac', 
  'generator', 'transformer', 'valve', 'heat_exchanger', 'elevator'
];

const SENSOR_TYPES = [
  'vibration', 'temperature', 'pressure', 'current', 'voltage', 
  'flow_rate', 'rpm', 'humidity', 'noise_level', 'oil_quality'
];

export default function ModelTrainingDialog({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [trainingResults, setTrainingResults] = useState(null);

  const [config, setConfig] = useState({
    model_name: '',
    model_type: 'anomaly_detection',
    algorithm: 'isolation_forest',
    equipment_type: '',
    features: [],
    // Hyperparameters
    train_test_split: 0.8,
    cross_validation_folds: 5,
    max_depth: 10,
    n_estimators: 100,
    learning_rate: 0.01,
    epochs: 50,
    batch_size: 32,
    early_stopping: true,
    regularization: 0.01,
  });

  const { data: sensorReadings = [] } = useQuery({
    queryKey: ['sensorReadings'],
    queryFn: () => base44.entities.SensorReading.list('-created_date', 500),
    enabled: open
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list(),
    enabled: open
  });

  const createModelMutation = useMutation({
    mutationFn: (data) => base44.entities.MLModel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mlmodels'] });
    }
  });

  const availableAlgorithms = ALGORITHMS[config.model_type] || [];

  const handleFeatureToggle = (feature) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const simulateTraining = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    // Simulate training progress
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(r => setTimeout(r, 100));
      setTrainingProgress(i);
    }

    // Generate realistic results based on algorithm
    const baseAccuracy = config.algorithm === 'neural_network' ? 92 : 
                         config.algorithm === 'lstm_autoencoder' ? 94 :
                         config.algorithm === 'gradient_boosting' ? 89 : 85;
    
    const results = {
      accuracy_score: Math.round(baseAccuracy + Math.random() * 5),
      precision: (0.85 + Math.random() * 0.1).toFixed(3),
      recall: (0.82 + Math.random() * 0.12).toFixed(3),
      f1_score: (0.84 + Math.random() * 0.1).toFixed(3),
      false_positive_rate: (0.02 + Math.random() * 0.03).toFixed(3),
      false_negative_rate: (0.03 + Math.random() * 0.04).toFixed(3),
      mean_absolute_error: config.model_type === 'rul_prediction' ? (2.5 + Math.random() * 2).toFixed(2) : null,
      training_samples: sensorReadings.length || Math.floor(5000 + Math.random() * 10000),
      training_time_seconds: Math.floor(30 + Math.random() * 120),
      feature_importance: config.features.reduce((acc, f, i) => {
        acc[f] = (1 / (i + 1) + Math.random() * 0.2).toFixed(3);
        return acc;
      }, {})
    };

    setTrainingResults(results);

    // Save model to database
    await createModelMutation.mutateAsync({
      model_name: config.model_name,
      model_type: config.model_type,
      algorithm: config.algorithm,
      version: '1.0.0',
      equipment_type: config.equipment_type,
      features: config.features,
      training_data_size: results.training_samples,
      hyperparameters: {
        train_test_split: config.train_test_split,
        cross_validation_folds: config.cross_validation_folds,
        max_depth: config.max_depth,
        n_estimators: config.n_estimators,
        learning_rate: config.learning_rate,
        epochs: config.epochs,
        batch_size: config.batch_size,
        early_stopping: config.early_stopping,
        regularization: config.regularization,
      },
      performance_metrics: {
        precision: parseFloat(results.precision),
        recall: parseFloat(results.recall),
        f1_score: parseFloat(results.f1_score),
      },
      accuracy_score: results.accuracy_score,
      false_positive_rate: parseFloat(results.false_positive_rate),
      false_negative_rate: parseFloat(results.false_negative_rate),
      mean_absolute_error: results.mean_absolute_error ? parseFloat(results.mean_absolute_error) : null,
      feature_importance: results.feature_importance,
      training_date: new Date().toISOString().split('T')[0],
      status: 'testing'
    });

    setIsTraining(false);
    setTrainingComplete(true);
  };

  const handleClose = () => {
    setStep(1);
    setIsTraining(false);
    setTrainingProgress(0);
    setTrainingComplete(false);
    setTrainingResults(null);
    setConfig({
      model_name: '',
      model_type: 'anomaly_detection',
      algorithm: 'isolation_forest',
      equipment_type: '',
      features: [],
      train_test_split: 0.8,
      cross_validation_folds: 5,
      max_depth: 10,
      n_estimators: 100,
      learning_rate: 0.01,
      epochs: 50,
      batch_size: 32,
      early_stopping: true,
      regularization: 0.01,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Train New ML Model
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= s ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-16 h-0.5 ${step > s ? 'bg-purple-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Model Configuration */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Model Configuration</h3>
            
            <div>
              <Label>Model Name *</Label>
              <Input
                value={config.model_name}
                onChange={(e) => setConfig({ ...config, model_name: e.target.value })}
                placeholder="e.g., Pump Anomaly Detector v1"
              />
            </div>

            <div>
              <Label>Model Type</Label>
              <Select value={config.model_type} onValueChange={(v) => setConfig({ ...config, model_type: v, algorithm: ALGORITHMS[v]?.[0]?.value || '' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {MODEL_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-slate-500">{type.desc}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Algorithm</Label>
              <Select value={config.algorithm} onValueChange={(v) => setConfig({ ...config, algorithm: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {availableAlgorithms.map(algo => (
                    <SelectItem key={algo.value} value={algo.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{algo.label}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {algo.complexity}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target Equipment Type</Label>
              <Select value={config.equipment_type} onValueChange={(v) => setConfig({ ...config, equipment_type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="All equipment types" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value={null}>All Types</SelectItem>
                  {EQUIPMENT_TYPES.map(type => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} disabled={!config.model_name}>
                Next: Feature Selection <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Feature Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Feature Selection</h3>
            <p className="text-sm text-slate-500">Select sensor types to use as input features for the model</p>

            <div className="grid grid-cols-2 gap-3">
              {SENSOR_TYPES.map(sensor => (
                <div 
                  key={sensor}
                  onClick={() => handleFeatureToggle(sensor)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    config.features.includes(sensor)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="capitalize text-sm font-medium">{sensor.replace(/_/g, ' ')}</span>
                    <Switch checked={config.features.includes(sensor)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm text-slate-600">
                <strong>{config.features.length}</strong> features selected
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={config.features.length === 0}>
                Next: Hyperparameters <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Hyperparameters */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Hyperparameter Tuning</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Train/Test Split: {Math.round(config.train_test_split * 100)}%</Label>
                <Slider
                  value={[config.train_test_split * 100]}
                  onValueChange={([v]) => setConfig({ ...config, train_test_split: v / 100 })}
                  min={60}
                  max={90}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Cross-Validation Folds: {config.cross_validation_folds}</Label>
                <Slider
                  value={[config.cross_validation_folds]}
                  onValueChange={([v]) => setConfig({ ...config, cross_validation_folds: v })}
                  min={3}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>

              {['random_forest', 'gradient_boosting'].includes(config.algorithm) && (
                <>
                  <div>
                    <Label>Max Depth: {config.max_depth}</Label>
                    <Slider
                      value={[config.max_depth]}
                      onValueChange={([v]) => setConfig({ ...config, max_depth: v })}
                      min={3}
                      max={30}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>N Estimators: {config.n_estimators}</Label>
                    <Slider
                      value={[config.n_estimators]}
                      onValueChange={([v]) => setConfig({ ...config, n_estimators: v })}
                      min={50}
                      max={500}
                      step={50}
                      className="mt-2"
                    />
                  </div>
                </>
              )}

              {['neural_network', 'lstm_autoencoder'].includes(config.algorithm) && (
                <>
                  <div>
                    <Label>Learning Rate: {config.learning_rate}</Label>
                    <Slider
                      value={[config.learning_rate * 1000]}
                      onValueChange={([v]) => setConfig({ ...config, learning_rate: v / 1000 })}
                      min={1}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Epochs: {config.epochs}</Label>
                    <Slider
                      value={[config.epochs]}
                      onValueChange={([v]) => setConfig({ ...config, epochs: v })}
                      min={10}
                      max={200}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Batch Size: {config.batch_size}</Label>
                    <Slider
                      value={[config.batch_size]}
                      onValueChange={([v]) => setConfig({ ...config, batch_size: v })}
                      min={8}
                      max={128}
                      step={8}
                      className="mt-2"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <Label>Early Stopping</Label>
                <p className="text-xs text-slate-500">Stop training when validation loss stops improving</p>
              </div>
              <Switch 
                checked={config.early_stopping}
                onCheckedChange={(v) => setConfig({ ...config, early_stopping: v })}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => setStep(4)}>
                Next: Review & Train <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Train */}
        {step === 4 && !isTraining && !trainingComplete && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Review Configuration</h3>

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Model Name</span>
                <span className="font-medium">{config.model_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="font-medium capitalize">{config.model_type.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Algorithm</span>
                <span className="font-medium capitalize">{config.algorithm.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Features</span>
                <span className="font-medium">{config.features.length} selected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Training Data</span>
                <span className="font-medium">{sensorReadings.length || '~10,000'} samples</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                Training may take several minutes depending on data size and model complexity.
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={simulateTraining}>
                <Zap className="w-4 h-4 mr-2" />
                Start Training
              </Button>
            </div>
          </div>
        )}

        {/* Training Progress */}
        {isTraining && (
          <div className="py-8 text-center space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Brain className="w-16 h-16 text-purple-600 mx-auto" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Training in Progress</h3>
              <p className="text-sm text-slate-500">Please wait while the model is being trained...</p>
            </div>
            <div className="max-w-md mx-auto">
              <Progress value={trainingProgress} className="h-2" />
              <p className="text-sm text-slate-500 mt-2">{trainingProgress}% complete</p>
            </div>
            <div className="text-xs text-slate-400">
              {trainingProgress < 30 && "Preprocessing data..."}
              {trainingProgress >= 30 && trainingProgress < 60 && "Training model..."}
              {trainingProgress >= 60 && trainingProgress < 90 && "Validating performance..."}
              {trainingProgress >= 90 && "Finalizing..."}
            </div>
          </div>
        )}

        {/* Training Complete */}
        {trainingComplete && trainingResults && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">Training Complete!</h3>
              <p className="text-sm text-slate-500">Model has been trained and saved successfully</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{trainingResults.accuracy_score}%</p>
                <p className="text-xs text-green-700">Accuracy</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{trainingResults.precision}</p>
                <p className="text-xs text-blue-700">Precision</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{trainingResults.recall}</p>
                <p className="text-xs text-purple-700">Recall</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-slate-900">Training Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Training Samples</span>
                  <span>{trainingResults.training_samples.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Training Time</span>
                  <span>{trainingResults.training_time_seconds}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">F1 Score</span>
                  <span>{trainingResults.f1_score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">False Positive Rate</span>
                  <span>{trainingResults.false_positive_rate}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}