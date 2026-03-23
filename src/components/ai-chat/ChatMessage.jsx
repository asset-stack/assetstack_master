import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

function CopyButton({ text }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 opacity-0 group-hover/code:opacity-100 transition-opacity min-h-0 min-w-0"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

const markdownComponents = {
  p: ({ children }) => (
    <p className="my-2 leading-relaxed text-slate-700">{children}</p>
  ),
  h1: ({ children }) => (
    <h1 className="text-lg font-bold text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-100">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-slate-900 mt-3 mb-1.5">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-bold text-slate-800 mt-2.5 mb-1">{children}</h3>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-slate-600 italic">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="my-2 ml-1 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 ml-1 space-y-1 list-decimal list-inside">{children}</ol>
  ),
  li: ({ children, ordered }) => (
    <li className="flex gap-2 text-slate-700 leading-relaxed">
      <span className="text-indigo-400 mt-1.5 shrink-0">•</span>
      <span className="flex-1">{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-3 border-indigo-300 bg-indigo-50/50 pl-4 pr-3 py-2 my-2 rounded-r-lg text-slate-600 italic">
      {children}
    </blockquote>
  ),
  code: ({ inline, className, children }) => {
    const text = String(children).replace(/\n$/, '');
    if (inline) {
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-mono font-medium">
          {children}
        </code>
      );
    }
    return (
      <div className="relative group/code my-3">
        <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-xs font-mono leading-relaxed">
          <code>{children}</code>
        </pre>
        <CopyButton text={text} />
      </div>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto my-3 rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-50">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-slate-700 border-b border-slate-100">{children}</td>
  ),
  hr: () => <hr className="my-3 border-slate-200" />,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2 decoration-indigo-300 inline-link">
      {children}
    </a>
  ),
};

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mt-1 shrink-0 shadow-sm shadow-indigo-200">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div className={cn(
        "max-w-[85%] rounded-2xl",
        isUser
          ? "bg-slate-800 text-white px-4 py-3"
          : "bg-white border border-slate-200/80 shadow-sm px-5 py-4"
      )}>
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="text-sm">
            <ReactMarkdown
              className="max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-xl bg-slate-200 flex items-center justify-center mt-1 shrink-0">
          <User className="h-4 w-4 text-slate-600" />
        </div>
      )}
    </div>
  );
}