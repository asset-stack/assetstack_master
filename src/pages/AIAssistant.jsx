import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, History, Plus, Zap, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AgentMessageBubble from '@/components/ai-chat/AgentMessageBubble';
import ChatInput from '@/components/ai-chat/ChatInput';
import SuggestedQuestions from '@/components/ai-chat/SuggestedQuestions';
import ChatHistorySidebar from '@/components/ai-chat/ChatHistorySidebar';

const AGENT_NAME = 'asset_advisor';

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const scrollRef = useRef(null);
  const unsubRef = useRef(null);
  const queryClient = useQueryClient();

  // List past conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['agent-conversations'],
    queryFn: () => base44.agents.listConversations({ agent_name: AGENT_NAME }),
    initialData: [],
  });

  // Build sidebar-compatible session list
  const sessions = conversations.map(c => ({
    id: c.id,
    title: c.metadata?.name || c.messages?.[0]?.content?.slice(0, 60) || 'Untitled',
    messages: c.messages || [],
    created_date: c.created_date,
  }));

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Subscribe to conversation updates for streaming
  const subscribeToConversation = useCallback((convId) => {
    // Cleanup previous subscription
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    if (!convId) return;

    const unsub = base44.agents.subscribeToConversation(convId, (data) => {
      setMessages(data.messages || []);
      // Detect when AI stops streaming (last message is assistant and not empty)
      const last = data.messages?.[data.messages.length - 1];
      if (last && last.role === 'assistant' && last.content) {
        setIsLoading(false);
      }
    });
    unsubRef.current = unsub;
  }, []);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  // Deep link from Opportunity Radar: /AIAssistant?q=...
  const autoSentRef = useRef(false);
  useEffect(() => {
    if (autoSentRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      autoSentRef.current = true;
      window.history.replaceState({}, '', '/AIAssistant');
      handleSend(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (text, fileUrls = []) => {
    setIsLoading(true);

    let convId = conversationId;
    let conv;

    if (!convId) {
      // Create a new conversation
      conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: text.slice(0, 80) },
      });
      convId = conv.id;
      setConversationId(convId);
      subscribeToConversation(convId);
      queryClient.invalidateQueries({ queryKey: ['agent-conversations'] });
    }

    // Load fresh conversation object for addMessage
    if (!conv) {
      conv = await base44.agents.getConversation(convId);
    }

    // Add user message — the agent will respond automatically via subscription
    const payload = { role: 'user', content: text };
    if (fileUrls && fileUrls.length > 0) payload.file_urls = fileUrls;
    await base44.agents.addMessage(conv, payload);
  };

  const handleNewChat = () => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    setMessages([]);
    setConversationId(null);
    setIsLoading(false);
    setShowHistory(false);
  };

  const handleSelectSession = async (session) => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    setConversationId(session.id);
    setMessages(session.messages || []);
    subscribeToConversation(session.id);
    setShowHistory(false);
  };

  const handleDeleteSession = async (id) => {
    // Agent SDK doesn't have delete, so we just clear if it's active
    if (conversationId === id) handleNewChat();
    queryClient.invalidateQueries({ queryKey: ['agent-conversations'] });
  };

  return (
    <div className="flex h-[calc(100vh-60px)] lg:h-screen">
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        sessions={sessions}
        activeSessionId={conversationId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        collapsed={historyCollapsed}
        onToggleCollapse={() => setHistoryCollapsed(c => !c)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-slate-200 bg-white gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={() => setShowHistory(true)}>
              <History className="h-4 w-4" />
            </Button>
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">AssetMind</h1>
              <p className="text-xs text-slate-500">
                Full platform control — create, read, update, delete anything
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link to="/Opportunities">
              <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs">
                <Radar className="h-3.5 w-3.5 mr-1" /> Opportunity Radar
              </Button>
            </Link>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleNewChat} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> New Chat
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
                <AgentMessageBubble key={i} message={msg} />
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
    </div>
  );
}