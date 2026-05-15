import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Paperclip, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const MAX_FILE_MB = 20;
const ACCEPT = 'image/*,application/pdf,.csv,.xlsx,.xls,.txt,.json';

export default function ChatInput({ onSend, isLoading }) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [attachments, setAttachments] = useState([]); // {name, type, url, uploading}
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.onresult = (event) => {
        const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
        setInput(transcript);
      };
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
  }, [input]);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${MAX_FILE_MB}MB`);
        continue;
      }
      const tempId = Date.now() + Math.random();
      const placeholder = { id: tempId, name: file.name, type: file.type, uploading: true };
      setAttachments(prev => [...prev, placeholder]);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setAttachments(prev => prev.map(a => a.id === tempId ? { ...a, url: file_url, uploading: false } : a));
      } catch (e) {
        toast.error(`Upload failed: ${file.name}`);
        setAttachments(prev => prev.filter(a => a.id !== tempId));
      }
    }
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const text = input.trim();
    const readyFiles = attachments.filter(a => !a.uploading && a.url);
    if ((!text && readyFiles.length === 0) || isLoading) return;
    if (attachments.some(a => a.uploading)) {
      toast.info('Waiting for files to finish uploading…');
      return;
    }
    if (isListening && recognitionRef.current) recognitionRef.current.stop();
    onSend(text || '(see attached files)', readyFiles.map(a => a.url));
    setInput('');
    setAttachments([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isImage = (type) => type?.startsWith('image/');

  return (
    <div className="border-t border-slate-200 bg-white">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 sm:px-4 pt-3">
          {attachments.map((a) => (
            <div key={a.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-1 py-1.5 text-xs">
              {a.uploading ? (
                <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              ) : isImage(a.type) ? (
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
              )}
              <span className="text-slate-700 max-w-[180px] truncate">{a.name}</span>
              <button
                onClick={() => removeAttachment(a.id)}
                className="h-5 w-5 rounded hover:bg-slate-200 flex items-center justify-center text-slate-400"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3 sm:p-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="h-11 w-11 shrink-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
          aria-label="Attach files"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening…' : 'Ask AssetMind anything — predictions, scans, reports, or commands…'}
            rows={1}
            className={`w-full px-4 py-3 pr-12 rounded-xl border resize-none ${isListening ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors leading-relaxed`}
            disabled={isLoading}
            style={{ minHeight: '44px', maxHeight: '180px' }}
          />
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoice}
              disabled={isLoading}
              className={`absolute right-2 bottom-2 h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              aria-label={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
        </div>

        <Button
          type="submit"
          disabled={(!input.trim() && attachments.length === 0) || isLoading || attachments.some(a => a.uploading)}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 h-11 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}