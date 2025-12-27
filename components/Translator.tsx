
import React, { useState } from 'react';
import { TranslationMode } from '../types';
import { LiveTranslator } from './LiveTranslator';
import { ConversationTranslator } from './ConversationTranslator';
import { TranslationHistory } from './TranslationHistory';
import { Button } from './ui/Button';
import { Mic, Zap, MessageSquare, ArrowRight, ChevronLeft, History } from 'lucide-react';

type ViewMode = 'MENU' | 'CONVERSATION' | 'SIMULTANEOUS' | 'HISTORY';

export const Translator: React.FC = () => {
  const [view, setView] = useState<ViewMode>('MENU');
  
  // State for LiveTranslator props
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Vietnamese');

  // --- Screen A: Entry Menu ---
  if (view === 'MENU') {
      return (
          <div className="h-full bg-black text-white p-6 flex flex-col animate-in slide-in-from-left duration-300">
              <div className="mb-8 flex justify-between items-start">
                  <div>
                      <h1 className="text-3xl font-light">AI <span className="font-bold">Translate</span></h1>
                      <p className="text-zinc-500 text-sm mt-1">Select a translation mode</p>
                  </div>
                  <button 
                      onClick={() => setView('HISTORY')}
                      className="p-3 bg-zinc-900 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                      <History size={20} />
                  </button>
              </div>

              <div className="flex-1 space-y-4">
                  
                  {/* Card 1: Conversation */}
                  <button 
                    onClick={() => setView('CONVERSATION')}
                    className="w-full relative group bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-6 rounded-[2rem] text-left hover:border-blue-500/50 transition-all duration-300 overflow-hidden"
                  >
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                          <MessageSquare size={120} />
                      </div>
                      
                      <div className="relative z-10">
                          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                              <MessageSquare className="w-6 h-6 text-blue-400 group-hover:text-white" />
                          </div>
                          
                          <h2 className="text-xl font-bold mb-2">Conversation</h2>
                          <p className="text-zinc-500 text-sm leading-relaxed mb-6 max-w-[80%]">
                              Turn-based translation for two-way dialogue. Best for interviews and casual chats.
                          </p>
                          
                          <div className="flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:text-white transition-colors">
                              Start Session <ArrowRight size={16} />
                          </div>
                      </div>
                  </button>

                  {/* Card 2: Simultaneous */}
                  <button 
                    onClick={() => setView('SIMULTANEOUS')}
                    className="w-full relative group bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-6 rounded-[2rem] text-left hover:border-purple-500/50 transition-all duration-300 overflow-hidden"
                  >
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Zap size={120} />
                      </div>
                      
                      <div className="relative z-10">
                          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                              <Zap className="w-6 h-6 text-purple-400 group-hover:text-white" />
                          </div>
                          
                          <h2 className="text-xl font-bold mb-2">Simultaneous</h2>
                          <p className="text-zinc-500 text-sm leading-relaxed mb-6 max-w-[80%]">
                              Real-time interpretation. Continuous listening for meetings and lectures.
                          </p>
                          
                          <div className="flex items-center gap-2 text-sm font-bold text-purple-400 group-hover:text-white transition-colors">
                              Start Live Mode <ArrowRight size={16} />
                          </div>
                      </div>
                  </button>
              </div>
          </div>
      );
  }

  // --- Screen B: Conversation Mode ---
  if (view === 'CONVERSATION') {
      return (
          <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
              {/* Simple Back Header for Sub-screens */}
              <div className="bg-zinc-900 border-b border-white/10 px-4 py-2 flex items-center gap-2">
                  <button onClick={() => setView('MENU')} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                      <ChevronLeft className="text-white" />
                  </button>
                  <span className="font-bold text-sm text-white">Conversation Mode</span>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <ConversationTranslator />
              </div>
          </div>
      );
  }

  // --- Simultaneous Mode ---
  if (view === 'SIMULTANEOUS') {
      return (
           <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
              <div className="flex-1 overflow-hidden">
                <LiveTranslator 
                    sourceLanguage={sourceLang} 
                    targetLanguage={targetLang} 
                    onBack={() => setView('MENU')}
                />
              </div>
           </div>
      );
  }

  // --- History Mode ---
  if (view === 'HISTORY') {
      return (
          <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
              <TranslationHistory onBack={() => setView('MENU')} />
          </div>
      );
  }

  return null;
};
