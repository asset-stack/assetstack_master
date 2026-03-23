import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, BookOpen, History, Wrench, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatMessage from '@/components/ai-chat/ChatMessage';
import ChatInput from '@/components/ai-chat/ChatInput';
import SuggestedQuestions from '@/components/ai-chat/SuggestedQuestions';
import DocumentManager from '@/components/ai-chat/DocumentManager';
import ChatHistorySidebar from '@/components/ai-chat/ChatHistorySidebar';
import SaveToWorkOrderDialog from '@/components/ai-chat/SaveToWorkOrderDialog';
import OfflineBanner from '@/components/ai-chat/OfflineBanner';
import { offlineChatStore } from '@/components/ai-chat/OfflineChatManager';
import { buildContextSummary } from '@/components/ai-chat/buildContext';

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDocManager, setShowDocManager] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaveToWO, setShowSaveToWO] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [linkedWorkOrder, setLinkedWorkOrder] = useState({ id: null, title: null });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  // Network status
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  // Data queries — cache results for offline
  const { data: equipment = [] } = useQuery({ queryKey: ['ai-equipment'], queryFn: () => base44.entities.Equipment.list(), initialData: [] });
  const { data: tasks = [] } = useQuery({ queryKey: ['ai-tasks'], queryFn: () => base44.entities.MaintenanceTask.list(), initialData: [] });
  const { data: workOrders = [] } = useQuery({ queryKey: ['ai-workorders'], queryFn: () => base44.entities.WorkOrder.list(), initialData: [] });
  const { data: technicians = [] } = useQuery({ queryKey: ['ai-technicians'], queryFn: () => base44.entities.Technician.list(), initialData: [] });
  const { data: alerts = [] } = useQuery({ queryKey: ['ai-alerts'], queryFn: () => base44.entities.Alert.list(), initialData: [] });
  const { data: spareParts = [] } = useQuery({ queryKey: ['ai-spareparts'], queryFn: () => base44.entities.SparePart.list(), initialData: [] });
  const { data: sensors = [] } = useQuery({ queryKey: ['ai-sensors'], queryFn: () => base44.entities.SensorConfiguration.list(), initialData: [] });
  const { data: documents = [] } = useQuery({ queryKey: ['asset-documents'], queryFn: () => base44.entities.AssetDocument.list(), initialData: [] });
  const { data: chatSessions = [] } = useQuery({ queryKey: ['chat-sessions'], queryFn: () => base44.entities.ChatSession.list('-created_date', 50), initialData: [] });

  // Cache data for offline use whenever it changes
  useEffect(() => {
    if (equipment.length || tasks.length || workOrders.length) {
      offlineChatStore.cacheContext({ equipment, tasks, workOrders, technicians, alerts, spareParts, sensors });
    }
  }, [equipment, tasks, workOrders, technicians, alerts, spareParts, sensors]);

  useEffect(() => {
    if (documents.length) offlineChatStore.cacheDocs(documents);
  }, [documents]);

  useEffect(() => {
    if (chatSessions.length) offlineChatStore.cacheSessions(chatSessions);
  }, [chatSessions]);

  // Sync pending offline messages when coming back online
  useEffect(() => {
    if (!isOnline) return;
    const pending = offlineChatStore.getPendingMessages();
    if (pending.length === 0) return;

    const syncPending = async () => {
      for (const p of pending) {
        if (p.sessionId) {
          const session = chatSessions.find(s => s.id === p.sessionId);
          if (session) {
            await base44.entities.ChatSession.update(session.id, { messages: [...(session.messages || []), p.message] });
          }
        }
        offlineChatStore.removePendingMessage(p._id);
      }
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    };
    syncPending();
  }, [isOnline]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  // Get user info
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  useEffect(() => {
    base44.auth.me().then(u => { setUserName(u.full_name || ''); setUserEmail(u.email || ''); });
  }, []);

  // Save session to server
  const saveSession = async (msgs, sessionId, woId, woTitle) => {
    if (!isOnline) {
      // Queue for later
      msgs.forEach(m => offlineChatStore.addPendingMessage(sessionId, m));
      return sessionId;
    }

    if (sessionId) {
      await base44.entities.ChatSession.update(sessionId, {
        messages: msgs,
        work_order_id: woId || undefined,
        work_order_title: woTitle || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      return sessionId;
    } else {
      const title = msgs[0]?.content?.slice(0, 80) || 'New Chat';
      const session = await base44.entities.ChatSession.create({
        title,
        messages: msgs,
        technician_name: userName,
        technician_email: userEmail,
        work_order_id: woId || undefined,
        work_order_title: woTitle || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      return session.id;
    }
  };

  const handleSend = async (text) => {
    const timestamp = new Date().toISOString();
    const userMsg = { role: 'user', content: text, timestamp };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    // Get context — online or cached
    let contextData, docsData;
    if (isOnline) {
      contextData = { equipment, tasks, workOrders, technicians, alerts, spareParts, sensors };
      docsData = documents;
    } else {
      contextData = offlineChatStore.getCachedContext() || {};
      docsData = offlineChatStore.getCachedDocs();
    }

    const context = buildContextSummary(contextData);
    const docsKnowledge = (docsData || [])
      .filter(d => d.extracted_content)
      .map(d => `### ${d.name} (${d.document_type})\n${d.extracted_content}`)
      .join('\n\n');
    const conversationHistory = messages.slice(-10).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

    const prompt = `You are an expert AI assistant for AssetStack, an industrial asset management platform. You help technicians in the field with any question about equipment, procedures, troubleshooting, safety, and maintenance. You have access to all the organization's live data AND their documentation library (user manuals, maintenance guides, SOPs, etc.). Answer questions accurately using both the live data and documentation. Use markdown for formatting. Be specific with names, numbers, and dates. Reference documentation when applicable. If offline data is stale, note that.

## LIVE DATA SNAPSHOT
${context}

## DOCUMENTATION & KNOWLEDGE BASE
${docsKnowledge || 'No documentation uploaded yet.'}

## CONVERSATION HISTORY
${conversationHistory}

## USER QUESTION
${text}`;

    if (isOnline) {
      const response = await base44.integrations.Core.InvokeLLM({ prompt, model: 'claude_sonnet_4_6' });
      const assistantMsg = { role: 'assistant', content: response, timestamp: new Date().toISOString() };
      const allMsgs = [...newMessages, assistantMsg];
      setMessages(allMsgs);

      const sid = await saveSession(allMsgs, activeSessionId, linkedWorkOrder.id, linkedWorkOrder.title);
      setActiveSessionId(sid);
    } else {
      // Offline: use cached knowledge to provide basic help
      const offlineResponse = `⚠️ **Offline Mode** — I can't reach the AI server right now, but here's what I can do:\n\n` +
        `Your question has been saved and will be answered when you're back online.\n\n` +
        `**Cached info available:**\n` +
        `- ${(contextData.equipment || []).length} equipment records\n` +
        `- ${(contextData.workOrders || []).length} work orders\n` +
        `- ${(docsData || []).filter(d => d.extracted_content).length} indexed documents\n\n` +
        `Try searching the Knowledge Base documents in the meantime.`;

      const assistantMsg = { role: 'assistant', content: offlineResponse, timestamp: new Date().toISOString() };
      const allMsgs = [...newMessages, assistantMsg];
      setMessages(allMsgs);

      // Cache locally
      offlineChatStore.addPendingMessage(activeSessionId, userMsg);
      offlineChatStore.cacheActiveSession({ id: activeSessionId, messages: allMsgs });
    }
    setIsLoading(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveSessionId(null);
    setLinkedWorkOrder({ id: null, title: null });
  };

  const handleSelectSession = (session) => {
    setMessages(session.messages || []);
    setActiveSessionId(session.id);
    setLinkedWorkOrder({ id: session.work_order_id || null, title: session.work_order_title || null });
  };

  const handleDeleteSession = async (id) => {
    if (isOnline) {
      await base44.entities.ChatSession.delete(id);
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    }
    if (activeSessionId === id) handleNewChat();
  };

  const handleSaveToWorkOrder = async (woId, woTitle) => {
    setLinkedWorkOrder({ id: woId, title: woTitle });
    if (activeSessionId && isOnline) {
      await base44.entities.ChatSession.update(activeSessionId, { work_order_id: woId, work_order_title: woTitle });
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    }
  };

  const cachedContext = offlineChatStore.getCachedContext();
  const displaySessions = isOnline ? chatSessions : offlineChatStore.getCachedSessions();

  return (
    <div className="flex h-[calc(100vh-60px)] lg:h-screen">
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        sessions={displaySessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Offline banner */}
        {!isOnline && <OfflineBanner cachedAt={cachedContext?._cachedAt} />}

        {/* Header */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-slate-200 bg-white gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={() => setShowHistory(true)}>
              <History className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-900">AI Assistant</h1>
                {!isOnline && <WifiOff className="h-4 w-4 text-amber-500" />}
              </div>
              <p className="text-xs text-slate-500">
                {linkedWorkOrder.title ? `Linked to: ${linkedWorkOrder.title}` : 'Ask anything about your assets, tasks, and team'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowSaveToWO(true)} className="text-slate-600 text-xs">
              <Wrench className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">{linkedWorkOrder.id ? 'Change WO' : 'Link to WO'}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowDocManager(true)} className="text-slate-600 text-xs">
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Docs ({documents.length})</span>
            </Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleNewChat} className="text-slate-400 hover:text-slate-600 text-xs">
                <Trash2 className="h-3.5 w-3.5 mr-1" /> New
              </Button>
            )}
          </div>
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

      {/* Dialogs */}
      <DocumentManager open={showDocManager} onClose={() => setShowDocManager(false)} />
      <SaveToWorkOrderDialog
        open={showSaveToWO}
        onClose={() => setShowSaveToWO(false)}
        workOrders={workOrders}
        onSave={handleSaveToWorkOrder}
        currentWorkOrderId={linkedWorkOrder.id}
      />
    </div>
  );
}