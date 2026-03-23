import React from 'react';
import { Plus, MessageSquare, Wrench, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import moment from 'moment';

export default function ChatHistorySidebar({ sessions, activeSessionId, onSelectSession, onNewChat, onDeleteSession, isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/30 z-30" onClick={onClose} />
      )}

      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-3 border-b border-slate-100">
          <Button onClick={onNewChat} className="w-full bg-indigo-600 hover:bg-indigo-700" size="sm">
            <Plus className="h-4 w-4 mr-1" /> New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No chat history yet</p>
          ) : (
            sessions.map(session => (
              <div
                key={session.id}
                onClick={() => { onSelectSession(session); onClose?.(); }}
                className={cn(
                  "flex items-start gap-2 p-2.5 rounded-lg cursor-pointer group transition-colors",
                  activeSessionId === session.id 
                    ? "bg-indigo-50 border border-indigo-100" 
                    : "hover:bg-slate-50"
                )}
              >
                <MessageSquare className={cn("h-4 w-4 mt-0.5 shrink-0", activeSessionId === session.id ? "text-indigo-600" : "text-slate-400")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{session.title || 'New Chat'}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400">{moment(session.created_date).fromNow()}</span>
                    {session.work_order_id && (
                      <span className="flex items-center gap-0.5 text-[10px] text-indigo-500">
                        <Wrench className="h-2.5 w-2.5" /> {session.work_order_title || 'WO'}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-slate-400 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}