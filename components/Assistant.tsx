
import React, { useState, useRef, useEffect } from 'react';
import { aiGateway } from '../services/aiGateway';
import { chatRepository } from '../services/chatRepository';
import { analytics } from '../services/analyticsService';
import { ChatMessage } from '../types';
import { Send, Bot, Sparkles, Paperclip, X, Copy, ThumbsUp, ThumbsDown, Check, Trash2, Image as ImageIcon } from 'lucide-react';

export const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    const history = chatRepository.getMessages();
    if (history.length > 0) {
        setMessages(history);
    } else {
        setMessages([{ 
            id: 'init', 
            role: 'model', 
            text: 'Hello, I am Mercy. I can see what you see. How can I assist you today?', 
            timestamp: Date.now() 
        }]);
    }
  }, []);

  // Save history on change
  useEffect(() => {
      if (messages.length > 0) {
          chatRepository.saveMessages(messages);
      }
      scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setAttachment(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const clearChat = () => {
      if (confirm("Clear all chat history?")) {
          chatRepository.clearHistory();
          setMessages([{ 
            id: Date.now().toString(), 
            role: 'model', 
            text: 'History cleared. How can I help?', 
            timestamp: Date.now() 
        }]);
      }
  };

  const updateFeedback = (msgId: string, type: 'like' | 'dislike') => {
      setMessages(prev => prev.map(msg => {
          if (msg.id === msgId) {
              // Toggle if already selected
              const newVal = msg.feedback === type ? null : type;
              return { ...msg, feedback: newVal };
          }
          return msg;
      }));
  };

  const copyToClipboard = async (text: string) => {
      try {
          await navigator.clipboard.writeText(text);
          // Visual feedback could be added here
      } catch (err) {
          console.error('Failed to copy', err);
      }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
      attachment: attachment || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachment(null);
    setLoading(true);

    // Analytics Hook
    analytics.logChatSend(!!userMsg.attachment);

    try {
      // Create placeholder
      const aiMsgId = (Date.now() + 1).toString();
      const aiMsgPlaceholder: ChatMessage = {
        id: aiMsgId,
        role: 'model',
        text: '', 
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsgPlaceholder]);

      // Stream response using Gateway
      const stream = aiGateway.chatStream(messages, userMsg.text, userMsg.attachment);
      
      let fullText = "";
      for await (const chunk of stream) {
          fullText += chunk;
          setMessages(prev => prev.map(m => 
              m.id === aiMsgId ? { ...m, text: fullText } : m
          ));
          scrollToBottom();
      }

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "I encountered an error connecting to the network.",
          timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white relative">
        <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileSelect} 
        />

        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/50 backdrop-blur sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
                    <Sparkles className="text-white w-5 h-5 animate-pulse" />
                </div>
                <div>
                    <h2 className="font-bold flex items-center gap-2">
                        Mercy AI
                        <span className="bg-white/10 text-[10px] px-1.5 py-0.5 rounded text-zinc-300">BETA</span>
                    </h2>
                    <p className="text-xs text-zinc-500">Multimodal Assistant</p>
                </div>
            </div>
            <button 
                onClick={clearChat}
                className="p-2 text-zinc-600 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                title="Clear History"
            >
                <Trash2 size={18} />
            </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-4">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-white' : 'bg-zinc-800'}`}>
                            {msg.role === 'user' ? (
                                <div className="w-3 h-3 bg-black rounded-full" />
                            ) : (
                                <Bot className="w-4 h-4 text-zinc-400" />
                            )}
                        </div>

                        <div className="flex flex-col gap-1 min-w-0">
                            {/* Message Bubble */}
                            <div className={`
                                rounded-2xl p-3 text-sm leading-relaxed shadow-sm overflow-hidden
                                ${msg.role === 'user' 
                                    ? 'bg-white text-black rounded-tr-none' 
                                    : 'bg-zinc-900 text-zinc-100 border border-white/10 rounded-tl-none'}
                            `}>
                                {msg.attachment && (
                                    <div className="mb-3 rounded-lg overflow-hidden border border-black/10">
                                        <img src={msg.attachment} alt="Attachment" className="max-w-full h-auto object-cover" />
                                    </div>
                                )}
                                
                                <div className="whitespace-pre-wrap break-words">
                                    {msg.text || (
                                        <span className="flex gap-1 items-center h-5">
                                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-100"></span>
                                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-200"></span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Assistant Actions Toolbar */}
                            {msg.role === 'model' && msg.text && (
                                <div className="flex items-center gap-1 ml-1">
                                    <ActionButton icon={Copy} onClick={() => copyToClipboard(msg.text)} />
                                    <div className="w-px h-3 bg-zinc-800 mx-1"></div>
                                    <ActionButton 
                                        icon={ThumbsUp} 
                                        isActive={msg.feedback === 'like'} 
                                        onClick={() => updateFeedback(msg.id, 'like')} 
                                    />
                                    <ActionButton 
                                        icon={ThumbsDown} 
                                        isActive={msg.feedback === 'dislike'} 
                                        onClick={() => updateFeedback(msg.id, 'dislike')} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/90 backdrop-blur-md border-t border-white/10">
            {/* Attachment Preview */}
            {attachment && (
                <div className="relative inline-block mb-3 animate-in slide-in-from-bottom-2">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/20 relative group">
                        <img src={attachment} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                                onClick={() => setAttachment(null)}
                                className="p-1 rounded-full bg-red-500/80 text-white"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-2 items-end">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        w-12 h-12 rounded-full flex items-center justify-center border transition-all flex-shrink-0
                        ${attachment 
                            ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                            : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800'}
                    `}
                >
                    {attachment ? <ImageIcon size={20} /> : <Paperclip size={20} />}
                </button>
                
                <div className="flex-1 bg-zinc-900 border border-white/10 rounded-3xl flex items-center overflow-hidden focus-within:border-white/30 focus-within:bg-zinc-800 transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={attachment ? "Add a caption..." : "Ask anything..."}
                        className="flex-1 bg-transparent px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                </div>
                
                <button 
                    onClick={handleSend}
                    disabled={(!input.trim() && !attachment) || loading}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-600 hover:scale-105 transition-all shadow-lg flex-shrink-0"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    </div>
  );
};

// Helper for action buttons
const ActionButton = ({ icon: Icon, onClick, isActive }: { icon: any, onClick: () => void, isActive?: boolean }) => {
    const [clicked, setClicked] = useState(false);

    const handleClick = () => {
        setClicked(true);
        onClick();
        setTimeout(() => setClicked(false), 1000);
    };

    if (clicked && Icon === Copy) {
        return (
            <span className="p-1.5 text-green-500">
                <Check size={14} />
            </span>
        );
    }

    return (
        <button 
            onClick={handleClick}
            className={`
                p-1.5 rounded-lg transition-colors
                ${isActive ? 'text-blue-400 bg-blue-500/10' : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/5'}
            `}
        >
            <Icon size={14} className={isActive ? 'fill-current' : ''} />
        </button>
    );
};
