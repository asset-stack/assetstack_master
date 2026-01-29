import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, X, Loader2, Wrench, AlertTriangle, 
  CheckCircle2, Clock, ArrowRight, Zap
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const severityColors = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200'
};

const priorityIcons = {
  immediate: <AlertTriangle className="w-4 h-4 text-red-500" />,
  high: <Zap className="w-4 h-4 text-orange-500" />,
  medium: <Clock className="w-4 h-4 text-amber-500" />,
  low: <CheckCircle2 className="w-4 h-4 text-green-500" />
};

export default function AnomalyCausesPanel({ anomaly, onClose, onCreateTask }) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (anomaly) {
      analyzeAnomaly();
    }
  }, [anomaly]);

  const analyzeAnomaly = async () => {
    setLoading(true);
    
    const prompt = `Analyze the following structural anomaly and provide potential causes and recommended maintenance actions:

ANOMALY DETAILS:
- Type: ${anomaly.type?.replace(/_/g, ' ')}
- Severity: ${anomaly.severity}
- Location: ${anomaly.location_description || 'Not specified'}
- Measurement: ${anomaly.measurement_value ? `${anomaly.measurement_value} ${anomaly.measurement_unit}` : 'Not measured'}
- Notes: ${anomaly.notes || 'None'}

Please provide:
1. Most likely causes (ranked by probability)
2. Contributing factors
3. Recommended maintenance actions with priority levels
4. Estimated urgency for repair
5. Potential risks if left unaddressed`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          likely_causes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                cause: { type: "string" },
                probability: { type: "string" },
                explanation: { type: "string" }
              }
            }
          },
          contributing_factors: { type: "array", items: { type: "string" } },
          maintenance_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string" },
                estimated_time: { type: "string" },
                required_skills: { type: "array", items: { type: "string" } }
              }
            }
          },
          urgency: { type: "string" },
          risks_if_unaddressed: { type: "array", items: { type: "string" } }
        }
      }
    });

    setAnalysis(response);
    setLoading(false);
  };

  const typeIcons = {
    crack: '🔨', deformation: '📐', corrosion: '🧪', displacement: '↔️',
    missing_component: '❓', structural_damage: '⚠️', surface_degradation: '🔍'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 w-[420px] max-h-[500px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-20"
    >
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            AI Analysis & Recommendations
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {/* Anomaly Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{typeIcons[anomaly?.type] || '⚠️'}</span>
            <div className="flex-1">
              <p className="font-medium text-slate-900 capitalize">
                {anomaly?.type?.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-slate-500">{anomaly?.location_description}</p>
            </div>
            <Badge className={severityColors[anomaly?.severity]}>
              {anomaly?.severity}
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
            <p className="text-sm text-slate-500">Analyzing anomaly...</p>
          </div>
        ) : analysis ? (
          <div className="p-4 space-y-4">
            {/* Urgency Badge */}
            <div className={`p-3 rounded-lg ${
              analysis.urgency?.toLowerCase().includes('immediate') ? 'bg-red-50 border border-red-200' :
              analysis.urgency?.toLowerCase().includes('high') ? 'bg-orange-50 border border-orange-200' :
              'bg-amber-50 border border-amber-200'
            }`}>
              <p className="text-sm font-medium">
                <Clock className="w-4 h-4 inline mr-2" />
                Urgency: {analysis.urgency}
              </p>
            </div>

            {/* Likely Causes */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-2">Likely Causes</h4>
              <div className="space-y-2">
                {analysis.likely_causes?.map((cause, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-800">{cause.cause}</span>
                      <Badge variant="outline" className="text-xs">
                        {cause.probability}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{cause.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contributing Factors */}
            {analysis.contributing_factors?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-2">Contributing Factors</h4>
                <ul className="space-y-1">
                  {analysis.contributing_factors.map((factor, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 mt-0.5 text-slate-400" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Maintenance Actions */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Recommended Actions
              </h4>
              <div className="space-y-2">
                {analysis.maintenance_actions?.map((action, i) => (
                  <div key={i} className="p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {priorityIcons[action.priority?.toLowerCase()] || priorityIcons.medium}
                        <span className="text-sm font-medium text-slate-800">{action.action}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {action.estimated_time}
                      </Badge>
                      {action.required_skills?.map((skill, j) => (
                        <Badge key={j} variant="outline" className="text-xs bg-slate-50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 h-7 px-2"
                      onClick={() => onCreateTask && onCreateTask({
                        title: action.action,
                        type: 'corrective',
                        priority: action.priority?.toLowerCase() === 'immediate' ? 'urgent' : 
                                  action.priority?.toLowerCase() || 'medium',
                        description: `${anomaly.type?.replace(/_/g, ' ')} detected at ${anomaly.location_description}. ${action.action}`,
                        estimated_duration_hours: parseInt(action.estimated_time) || 2
                      })}
                    >
                      + Create Task
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks */}
            {analysis.risks_if_unaddressed?.length > 0 && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risks if Unaddressed
                </h4>
                <ul className="space-y-1">
                  {analysis.risks_if_unaddressed.map((risk, i) => (
                    <li key={i} className="text-xs text-red-700 flex items-start gap-2">
                      <span>•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}