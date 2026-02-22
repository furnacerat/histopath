import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, Volume2, VolumeX, ChevronLeft, Sparkles, Loader2, BrainCircuit, Headphones } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { CommuterSession, UserProgress } from '../types';
import { cn } from '../lib/utils';

interface CommuterViewProps {
  progress: UserProgress;
  onUpdateProgress: (progress: UserProgress) => void;
  onBack: () => void;
  displayName?: string;
}

export const CommuterView: React.FC<CommuterViewProps> = ({ progress, onUpdateProgress, onBack, displayName }) => {
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [history, setHistory] = useState<{ role: 'user' | 'model'; text: string }[]>(
    progress.commuterSession?.conversationHistory || [
      { role: 'model' as const, text: `Hey${displayName ? ` ${displayName}` : ''}! I'm your Commuter Companion. Let's get some histology practice in while you're on the move. What's one topic you've been working on lately?` }
    ]
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Handle initial greeting speech
  useEffect(() => {
    const hasSpokenInitial = sessionStorage.getItem('histo_commuter_initial_spoken');
    if (autoSpeak && history.length === 1 && history[0].role === 'model' && !hasSpokenInitial) {
      speak(history[0].text);
      sessionStorage.setItem('histo_commuter_initial_spoken', 'true');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) { }
      }
    };
  }, []);

  const speak = async (text: string) => {
    try {
      setIsSpeaking(true);
      console.log("Requesting speech generation for:", text);
      const { data, mimeType } = await geminiService.generateSpeech(text);
      const audioUrl = `data:${mimeType};base64,${data}`;

      console.log("Audio data received, format:", mimeType);

      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio();
        audioRef.current = audio;
      }

      console.log("Starting audio playback...");
      audio.src = audioUrl;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("Audio playing successfully");
          audio!.onended = () => {
            console.log("Playback ended naturally");
            setIsSpeaking(false);
          };
        }).catch((err) => {
          console.error("Audio playback failed:", err);
          setIsSpeaking(false);
          if (err.name === 'NotAllowedError' || err.message.includes('user gesture')) {
            const overlay = document.createElement('div');
            overlay.id = 'audio-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;';
            overlay.innerHTML = '<button id="enable-audio-btn" style="padding:20px 40px;font-size:18px;background:#4f46e5;color:white;border:none;border-radius:12px;cursor:pointer;">Tap to Enable Audio</button>';
            document.body.appendChild(overlay);
            document.getElementById('enable-audio-btn')?.addEventListener('click', () => {
              audio!.play().then(() => {
                document.getElementById('audio-overlay')?.remove();
              }).catch(console.error);
              document.getElementById('audio-overlay')?.remove();
            });
          }
        });
      }
    } catch (error) {
      console.error("Speech generation or playback failed:", error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      // Auto-send when speech is recognized
      handleSend(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim() || isTyping) return;

    const userMessage = messageToSend.trim();
    setInput('');
    const newHistory = [...history, { role: 'user' as const, text: userMessage }];
    setHistory(newHistory);
    setIsTyping(true);

    try {
      const userProfile = {
        mastery: progress.mastery,
        difficulty: progress.commuterSession?.difficulty || 'intermediate',
        recentSuccessRate: progress.commuterSession?.recentSuccessRate || 0.7,
      };

      const response = await geminiService.startCommuterChat(newHistory, userProfile);
      if (response) {
        const updatedHistory = [...newHistory, { role: 'model' as const, text: response }];
        setHistory(updatedHistory);

        const newSession: CommuterSession = {
          difficulty: userProfile.difficulty,
          recentSuccessRate: userProfile.recentSuccessRate,
          conversationHistory: updatedHistory.slice(-10),
        };

        onUpdateProgress({
          ...progress,
          commuterSession: newSession
        });

        if (autoSpeak) {
          speak(response);
        }
      }
    } catch (error) {
      console.error("Commuter chat failed", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Headphones size={20} />
            </div>
            <div>
              <h1 className="text-xl font-display italic text-slate-900">Commuter Companion</h1>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Active Learning</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={cn(
              "p-2 rounded-full transition-all",
              autoSpeak ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
            )}
            title={autoSpeak ? "Auto-speak ON" : "Auto-speak OFF"}
          >
            {autoSpeak ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 px-2 mb-6 scroll-smooth"
      >
        {history.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex flex-col",
              msg.role === 'user' ? "items-end" : "items-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
              msg.role === 'user'
                ? "bg-slate-900 text-white rounded-tr-none"
                : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
            )}>
              {msg.text}
            </div>
            {msg.role === 'model' && (
              <button
                onClick={() => isSpeaking ? stopSpeaking() : speak(msg.text)}
                className="mt-2 flex items-center space-x-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
              </button>
            )}
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex items-center space-x-2 text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs italic">Companion is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleListening}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl relative group",
              isListening
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-white text-slate-900 hover:bg-slate-50"
            )}
            title={isListening ? "Listening..." : "Click to talk"}
          >
            {isListening ? <Mic size={32} /> : <MicOff size={32} className="text-slate-400" />}
            {isListening && (
              <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap">
                Listening to you...
              </span>
            )}
          </button>
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isListening ? "Listening..." : "Type your answer..."}
              className="w-full p-4 pr-16 bg-white border border-slate-200 rounded-3xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none shadow-xl"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-30 shadow-lg"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <p className="mt-4 text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          Hands-free mode: Tap the mic to speak your answer.
        </p>
      </div>
    </div>
  );
};
