import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const TutorView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Histology License Tutor. Ask me anything about fixation, staining, microtomy, or lab safety. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await geminiService.askTutor(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] sm:h-[600px] w-full max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
            <Bot size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-800">AI Histology Tutor</h3>
            <div className="flex items-center text-[10px] sm:text-xs text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mr-1 sm:mr-1.5 animate-pulse"></span>
              Online
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 text-slate-400 text-[10px] sm:text-xs font-mono">
          <Sparkles size={12} />
          <span className="hidden sm:inline">Gemini 3.1 Pro</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex items-start space-x-2 sm:space-x-4",
            msg.role === 'user' ? "flex-row-reverse space-x-reverse" : ""
          )}>
            <div className={cn(
              "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === 'assistant' ? "bg-slate-100 text-slate-600" : "bg-slate-900 text-white"
            )}>
              {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={cn(
              "max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-xl sm:rounded-2xl",
              msg.role === 'assistant' ? "bg-slate-50 text-slate-800 rounded-tl-none" : "bg-slate-900 text-white rounded-tr-none"
            )}>
              <div className="markdown-body prose prose-slate prose-sm sm:prose-base max-w-none text-sm sm:text-base">
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start space-x-2 sm:space-x-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Bot size={14} />
            </div>
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl rounded-tl-none flex items-center space-x-2">
              <Loader2 size={14} className="animate-spin text-slate-400" />
              <span className="text-xs sm:text-sm text-slate-500 font-medium">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about stains, safety..."
            className="w-full pl-4 sm:pl-6 pr-12 sm:pr-14 py-3 sm:py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none text-sm sm:text-base"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 sm:right-2 p-2 sm:p-3 bg-slate-900 text-white rounded-lg sm:rounded-xl hover:bg-slate-800 disabled:opacity-30 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
