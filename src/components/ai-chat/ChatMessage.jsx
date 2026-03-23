import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center mt-1 shrink-0">
          <Bot className="h-4 w-4 text-indigo-600" />
        </div>
      )}
      <div className={cn("max-w-[85%] rounded-2xl px-4 py-3", 
        isUser 
          ? "bg-indigo-600 text-white" 
          : "bg-white border border-slate-200 shadow-sm"
      )}>
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <ReactMarkdown
            className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            components={{
              p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="my-1.5 ml-4 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="my-1.5 ml-4 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="my-0.5">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
              h1: ({ children }) => <h1 className="text-base font-semibold my-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm font-semibold my-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold my-1.5">{children}</h3>,
              code: ({ inline, children }) => inline 
                ? <code className="px-1 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">{children}</code>
                : <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto my-2 text-xs"><code>{children}</code></pre>,
              table: ({ children }) => <div className="overflow-x-auto my-2"><table className="min-w-full text-xs border-collapse">{children}</table></div>,
              th: ({ children }) => <th className="border border-slate-200 px-2 py-1 bg-slate-50 font-semibold text-left">{children}</th>,
              td: ({ children }) => <td className="border border-slate-200 px-2 py-1">{children}</td>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center mt-1 shrink-0">
          <User className="h-4 w-4 text-slate-600" />
        </div>
      )}
    </div>
  );
}