import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatMessage from '@/components/ai-chat/ChatMessage';
import ChatInput from '@/components/ai-chat/ChatInput';
import SuggestedQuestions from '@/components/ai-chat/SuggestedQuestions';

function buildContextSummary(data) {
  const lines = [];

  if (data.equipment?.length) {
    lines.push(`## Equipment (${data.equipment.length} assets)`);
    data.equipment.forEach(e => {
      lines.push(`- **${e.name}** (${e.type}) | Location: ${e.location} | Status: ${e.status} | Health: ${e.health_score ?? 'N/A'}/100 | Risk: ${e.risk_level} | Operating Hours: ${e.operating_hours ?? 'N/A'} | RUL: ${e.remaining_useful_life_days ?? 'N/A'} days | Failure Prob: ${e.failure_probability ?? 'N/A'}%`);
    });
  }

  if (data.tasks?.length) {
    lines.push(`\n## Maintenance Tasks (${data.tasks.length})`);
    data.tasks.forEach(t => {
      lines.push(`- **${t.title}** | Type: ${t.type} | Priority: ${t.priority} | Status: ${t.status} | Scheduled: ${t.scheduled_date || 'N/A'} | Assigned: ${t.assigned_to || 'Unassigned'} | AI Recommended: ${t.ai_recommended ? 'Yes' : 'No'}`);
    });
  }

  if (data.workOrders?.length) {
    lines.push(`\n## Work Orders (${data.workOrders.length})`);
    data.workOrders.forEach(w => {
      lines.push(`- **${w.title}** (${w.work_order_number || 'N/A'}) | Type: ${w.type} | Priority: ${w.priority} | Status: ${w.status} | Assigned: ${w.assigned_to || 'Unassigned'} | Est Cost: $${w.estimated_cost ?? 'N/A'} | Actual Cost: $${w.actual_total_cost ?? 'N/A'}`);
    });
  }

  if (data.technicians?.length) {
    lines.push(`\n## Technicians (${data.technicians.length})`);
    data.technicians.forEach(t => {
      lines.push(`- **${t.name}** (${t.employee_id}) | Type: ${t.worker_type} | Level: ${t.certification_level} | Status: ${t.availability_status} | Rating: ${t.performance_rating ?? 'N/A'}/100 | Fix Rate: ${t.first_time_fix_rate ?? 'N/A'}% | Completed: ${t.completed_tasks_count ?? 0} tasks | Rate: $${t.hourly_rate ?? 'N/A'}/hr`);
    });
  }

  if (data.alerts?.length) {
    lines.push(`\n## Active Alerts (${data.alerts.length})`);
    data.alerts.forEach(a => {
      lines.push(`- **${a.title}** | Severity: ${a.severity} | Type: ${a.type} | Status: ${a.status} | Action: ${a.recommended_action || 'N/A'}`);
    });
  }

  if (data.spareParts?.length) {
    lines.push(`\n## Spare Parts Inventory (${data.spareParts.length})`);
    data.spareParts.forEach(p => {
      lines.push(`- **${p.name}** (${p.part_number}) | Category: ${p.category} | Stock: ${p.quantity_in_stock} | Min Level: ${p.minimum_stock_level} | Status: ${p.status} | Cost: $${p.unit_cost ?? 'N/A'}`);
    });
  }

  if (data.sensors?.length) {
    lines.push(`\n## Sensor Configurations (${data.sensors.length})`);
    data.sensors.forEach(s => {
      lines.push(`- **${s.sensor_name}** (${s.sensor_type}) | Status: ${s.status} | Last Value: ${s.last_reading_value ?? 'N/A'} ${s.unit || ''}`);
    });
  }

  return lines.join('\n');
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const { data: equipment } = useQuery({ queryKey: ['ai-equipment'], queryFn: () => base44.entities.Equipment.list(), initialData: [] });
  const { data: tasks } = useQuery({ queryKey: ['ai-tasks'], queryFn: () => base44.entities.MaintenanceTask.list(), initialData: [] });
  const { data: workOrders } = useQuery({ queryKey: ['ai-workorders'], queryFn: () => base44.entities.WorkOrder.list(), initialData: [] });
  const { data: technicians } = useQuery({ queryKey: ['ai-technicians'], queryFn: () => base44.entities.Technician.list(), initialData: [] });
  const { data: alerts } = useQuery({ queryKey: ['ai-alerts'], queryFn: () => base44.entities.Alert.list(), initialData: [] });
  const { data: spareParts } = useQuery({ queryKey: ['ai-spareparts'], queryFn: () => base44.entities.SparePart.list(), initialData: [] });
  const { data: sensors } = useQuery({ queryKey: ['ai-sensors'], queryFn: () => base44.entities.SensorConfiguration.list(), initialData: [] });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text) => {
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const context = buildContextSummary({ equipment, tasks, workOrders, technicians, alerts, spareParts, sensors });

    const conversationHistory = messages.slice(-10).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

    const prompt = `You are an expert AI assistant for AssetStack, an industrial asset management platform. You have access to all the organization's live data below. Answer the user's question accurately, concisely, and helpfully using ONLY the data provided. If data is insufficient, say so. Use markdown for formatting. Be specific with names, numbers, and dates.

## LIVE DATA SNAPSHOT
${context}

## CONVERSATION HISTORY
${conversationHistory}

## USER QUESTION
${text}`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] lg:h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-slate-200 bg-white">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">AI Assistant</h1>
          <p className="text-xs text-slate-500">Ask anything about your assets, tasks, and team</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="text-slate-400 hover:text-slate-600">
            <Trash2 className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50">
        {messages.length === 0 ? (
          <SuggestedQuestions onSelect={handleSend} />
        ) : (
          <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}