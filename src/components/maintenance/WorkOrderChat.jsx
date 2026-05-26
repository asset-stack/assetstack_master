import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Pin, Mic, Image, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

export default function WorkOrderChat({ workOrderId }) {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['wo-messages', workOrderId],
    queryFn: () => secureEntity('WorkOrderMessage').filter({ work_order_id: workOrderId }, '-created_date', 100),
    enabled: !!workOrderId,
    refetchInterval: 5000,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const sendMutation = useMutation({
    mutationFn: (data) => secureEntity('WorkOrderMessage').create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wo-messages', workOrderId] });
      setMessage('');
    },
  });

  useEffect(() => {
    if (!workOrderId) return;
    const unsubscribe = base44.entities.WorkOrderMessage.subscribe((event) => {
      if (event.data?.work_order_id === workOrderId) {
        queryClient.invalidateQueries({ queryKey: ['wo-messages', workOrderId] });
      }
    });
    return unsubscribe;
  }, [workOrderId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate({
      work_order_id: workOrderId,
      sender_name: currentUser?.full_name || 'Unknown',
      sender_email: currentUser?.email || '',
      message_type: 'text',
      content: message.trim(),
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const isImage = file.type.startsWith('image/');
    sendMutation.mutate({
      work_order_id: workOrderId,
      sender_name: currentUser?.full_name || 'Unknown',
      sender_email: currentUser?.email || '',
      message_type: isImage ? 'image' : 'file',
      content: file.name,
      file_url: file_url,
      file_name: file.name,
    });
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sortedMessages = [...messages].reverse();

  if (!workOrderId) {
    return <p className="text-center text-slate-400 py-8 text-sm">Save the work order first to enable chat.</p>;
  }

  return (
    <div className="flex flex-col h-[400px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : sortedMessages.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm">No messages yet. Start the conversation!</p>
        ) : (
          sortedMessages.map((msg) => {
            const isMe = msg.sender_email === currentUser?.email;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}>
                  {!isMe && (
                    <p className="text-xs font-semibold text-indigo-600 mb-1">{msg.sender_name}</p>
                  )}
                  {msg.message_type === 'image' && msg.file_url && (
                    <img src={msg.file_url} alt={msg.content} className="rounded-lg mb-2 max-w-full max-h-48 object-cover" />
                  )}
                  {msg.message_type === 'file' && msg.file_url && (
                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer" 
                       className={`flex items-center gap-2 mb-1 underline text-sm ${isMe ? 'text-indigo-200' : 'text-indigo-600'}`}>
                      <Paperclip className="w-3 h-3" /> {msg.file_name || 'Attachment'}
                    </a>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-3">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileUpload}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-slate-400 hover:text-slate-600 shrink-0"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-white border-slate-200"
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sendMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
          size="icon"
        >
          {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}