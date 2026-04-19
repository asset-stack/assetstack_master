import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChatInput({ onSend, isLoading }) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (isListening && recognitionRef.current) recognitionRef.current.stop();
    onSend(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 sm:p-4 border-t border-slate-200 bg-white">
      <div className="flex-1 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'Listening...' : 'Ask anything about your assets, tasks, technicians...'}
          className={`w-full px-4 py-3 pr-12 rounded-xl border ${isListening ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`}
          disabled={isLoading}
        />
        {voiceSupported && (
          <button
            type="button"
            onClick={toggleVoice}
            disabled={isLoading}
            className={`absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
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
        disabled={!input.trim() || isLoading}
        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}