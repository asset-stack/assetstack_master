import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Users, UserCheck, Brain, Loader2, ChevronRight, Clock, 
  Star, Award, AlertTriangle, CheckCircle2, Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SKILL_LEVEL_ORDER = { junior: 1, intermediate: 2, senior: 3, expert: 4, master: 5 };

export default function DynamicTaskAssignment({ task, workOrder, equipment, onAssign }) {
  const [showDialog, setShowDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => base44.entities.Technician.list('-created_date', 100),
  });

  const analyzeAndRecommend = async () => {
    setIsAnalyzing(true);
    setShowDialog(true);

    try {
      // Score each technician based on multiple factors
      const scoredTechnicians = technicians
        .filter(t => t.availability_status === 'available' || t.availability_status === 'busy')
        .map(tech => {
          let score = 0;
          const factors = [];

          // 1. Skill level match (0-25 points)
          const skillScore = (SKILL_LEVEL_ORDER[tech.certification_level] || 2) * 5;
          score += skillScore;
          factors.push({ name: 'Skill Level', score: skillScore, max: 25 });

          // 2. Equipment specialization (0-30 points)
          const equipType = equipment?.type;
          const hasSpecialization = tech.equipment_specializations?.includes(equipType);
          const specScore = hasSpecialization ? 30 : 0;
          score += specScore;
          factors.push({ name: 'Equipment Specialist', score: specScore, max: 30 });

          // 3. Workload availability (0-20 points)
          const currentLoad = tech.current_workload_hours || 0;
          const maxLoad = tech.max_weekly_hours || 40;
          const taskHours = task?.estimated_duration_hours || workOrder?.estimated_hours || 4;
          const availableHours = maxLoad - currentLoad;
          const canTakeTask = availableHours >= taskHours;
          const loadPercent = (currentLoad / maxLoad) * 100;
          const loadScore = canTakeTask ? Math.max(0, 20 - (loadPercent / 5)) : 0;
          score += loadScore;
          factors.push({ name: 'Workload Capacity', score: Math.round(loadScore), max: 20 });

          // 4. Performance rating (0-15 points)
          const perfScore = ((tech.performance_rating || 70) / 100) * 15;
          score += perfScore;
          factors.push({ name: 'Performance', score: Math.round(perfScore), max: 15 });

          // 5. Availability status (0-10 points)
          const availScore = tech.availability_status === 'available' ? 10 : 5;
          score += availScore;
          factors.push({ name: 'Availability', score: availScore, max: 10 });

          return {
            technician: tech,
            score: Math.round(score),
            maxScore: 100,
            factors,
            canTakeTask,
            availableHours: Math.round(availableHours),
            hasSpecialization
          };
        })
        .sort((a, b) => b.score - a.score);

      // Get AI insights
      const aiInsight = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this maintenance task assignment scenario and provide a brief recommendation (2-3 sentences):

Task: ${task?.title || workOrder?.title}
Type: ${task?.type || workOrder?.type}
Priority: ${task?.priority || workOrder?.priority}
Equipment: ${equipment?.name} (${equipment?.type})
Estimated Hours: ${task?.estimated_duration_hours || workOrder?.estimated_hours || 4}

Top 3 Technician Candidates:
${scoredTechnicians.slice(0, 3).map((s, i) => `
${i + 1}. ${s.technician.name}
   - Score: ${s.score}/100
   - Level: ${s.technician.certification_level}
   - Specializes in ${equipment?.type}: ${s.hasSpecialization ? 'Yes' : 'No'}
   - Current workload: ${s.technician.current_workload_hours || 0}/${s.technician.max_weekly_hours || 40}h
   - Performance: ${s.technician.performance_rating || 'N/A'}%
`).join('')}

Who should be assigned and why?`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendation: { type: "string" },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
            alternative_suggestion: { type: "string" }
          }
        }
      });

      setRecommendations({
        technicians: scoredTechnicians,
        aiInsight
      });
    } catch (error) {
      console.error('Error analyzing assignment:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAssign = (technicianId) => {
    onAssign?.(technicianId);
    setShowDialog(false);
  };

  return (
    <>
      <Button
        onClick={analyzeAndRecommend}
        variant="outline"
        className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
      >
        <Brain className="w-4 h-4 mr-2" />
        Smart Assign
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Smart Task Assignment
            </DialogTitle>
          </DialogHeader>

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-600">Analyzing technician availability and skills...</p>
            </div>
          ) : recommendations ? (
            <div className="space-y-6">
              {/* AI Insight */}
              {recommendations.aiInsight && (
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Brain className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900">AI Recommendation</h4>
                        <Badge className={
                          recommendations.aiInsight.confidence === 'high' ? 'bg-emerald-100 text-emerald-700' :
                          recommendations.aiInsight.confidence === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {recommendations.aiInsight.confidence} confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{recommendations.aiInsight.recommendation}</p>
                      {recommendations.aiInsight.alternative_suggestion && (
                        <p className="text-xs text-slate-500 mt-2 italic">
                          💡 {recommendations.aiInsight.alternative_suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Technician Rankings */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Ranked Candidates</h4>
                <div className="space-y-3">
                  {recommendations.technicians.slice(0, 5).map((rec, idx) => (
                    <motion.div
                      key={rec.technician.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-xl border ${
                        idx === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          idx === 0 ? 'bg-emerald-600 text-white' :
                          idx === 1 ? 'bg-slate-600 text-white' :
                          idx === 2 ? 'bg-amber-600 text-white' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {idx + 1}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-slate-900">{rec.technician.name}</h5>
                            <Badge variant="outline" className="text-xs capitalize">
                              {rec.technician.certification_level}
                            </Badge>
                            {rec.hasSpecialization && (
                              <Badge className="bg-violet-100 text-violet-700 text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                Specialist
                              </Badge>
                            )}
                            {!rec.canTakeTask && (
                              <Badge className="bg-amber-100 text-amber-700 text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Near Capacity
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {rec.availableHours}h available
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {rec.technician.performance_rating || 'N/A'}% rating
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {rec.technician.completed_tasks_count || 0} completed
                            </span>
                          </div>

                          {/* Score breakdown */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-slate-700">Score: {rec.score}/{rec.maxScore}</span>
                            <Progress value={rec.score} className="flex-1 h-2" />
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {rec.factors.map((factor, i) => (
                              <span key={i} className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                {factor.name}: {factor.score}/{factor.max}
                              </span>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={() => handleAssign(rec.technician.id)}
                          size="sm"
                          className={idx === 0 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Assign
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}