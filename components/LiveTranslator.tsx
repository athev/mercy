
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, ChevronLeft, MoreVertical, Save, Pause, Play, Globe, AlertCircle, RefreshCw, BarChart2, Check, X, Volume2, VolumeX } from 'lucide-react';
import { SimultaneousPipeline, PipelineState, TranscriptEvent } from '../services/translationPipeline';
import { translationHistoryRepository } from '../services/translationHistoryRepository';
import { analytics } from '../services/analyticsService';
import { TranslationSession } from '../types';

interface LiveTranslatorProps {
  sourceLanguage?: string;
  targetLanguage?: string;
  onBack?: () => void;
}

export const LiveTranslator: React.FC<LiveTranslatorProps> = ({ 
    sourceLanguage = 'English', 
    targetLanguage = 'Vietnamese',
    onBack 
}) => {
  // --- Pipeline State ---
  const pipeline = useMemo(() => new SimultaneousPipeline(), []);
  
  const [status, setStatus] = useState<PipelineState>('IDLE');
  const [audioLevel, setAudioLevel] = useState(0);
  const [sourceSegments, setSourceSegments] = useState<TranscriptEvent[]>([]);
  const [translatedSegments, setTranslatedSegments] = useState<{id: string, text: string}[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Session Metadata
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Refs for Auto-scroll
  const sourceEndRef = useRef<HTMLDivElement>(null);
  const targetEndRef = useRef<HTMLDivElement>(null);

  // --- Pipeline Bindings ---
  useEffect(() => {
    pipeline.onStatusChange = (s) => setStatus(s);
    pipeline.onAudioLevel = (l) => setAudioLevel(l);
    pipeline.onSourceTranscript = (evt) => {
        setSourceSegments(prev => {
            const cleanPrev = prev.filter(p => p.id !== 'interim_current');
            return [...cleanPrev, evt];
        });
    };
    pipeline.onTranslation = (evt) => {
        setTranslatedSegments(prev => [...prev, { id: evt.sourceId, text: evt.text }]);
    };
    pipeline.onError = (err) => {
        console.error("Pipeline Error:", err);
        setErrorMessage(err);
        setStatus('ERROR');
    };

    return () => {
        pipeline.stop();
    };
  }, [pipeline]);

  // --- Auto-scroll Effect ---
  useEffect(() => {
      sourceEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sourceSegments]);

  useEffect(() => {
      targetEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [translatedSegments]);

  // --- Actions ---

  const toggleSession = () => {
      setErrorMessage(null); // Clear previous errors
      
      if (status === 'IDLE' || status === 'PAUSED' || status === 'ERROR') {
          if (!startTime) setStartTime(Date.now());
          
          try {
             // CRITICAL: Warm up audio engine on user click
             pipeline.prepareAudio();
             
             pipeline.start(sourceLanguage, targetLanguage);
             pipeline.setAudioOutput(!isMuted); 
             analytics.logTranslation('start', 'simultaneous', `${sourceLanguage}-${targetLanguage}`);
          } catch(e) {
             setErrorMessage("Failed to initialize engine");
          }
      } else if (status === 'LISTENING') {
          pipeline.pause();
      }
  };

  const toggleMute = () => {
      const newState = !isMuted;
      setIsMuted(newState);
      pipeline.setAudioOutput(!newState);
  };

  const handleSave = () => {
      if (sourceSegments.length === 0) return;

      const session: TranslationSession = {
          id: Date.now().toString(),
          startTime: startTime || Date.now(),
          endTime: Date.now(),
          sourceLang: sourceLanguage,
          targetLang: targetLanguage,
          sourceTranscript: sourceSegments.filter(s => s.isFinal), 
          translatedTranscript: translatedSegments,
          audioPath: 'mock_audio_recording.wav' 
      };

      translationHistoryRepository.saveSession(session);
      
      // Show confirmation
      setShowSaveConfirm(true);
      setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const stopSession = () => {
      pipeline.stop();
      analytics.logTranslation('stop', 'simultaneous');
      setSourceSegments([]);
      setTranslatedSegments([]);
      setAudioLevel(0);
      setStartTime(null);
      setErrorMessage(null);
  };

  // --- Render Helpers ---
  const renderStatusIndicator = () => {
      switch (status) {
          case 'LISTENING':
              return (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full animate-pulse">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Live</span>
                  </div>
              );
          case 'PAUSED':
              return (
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 rounded-full">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Paused</span>
                  </div>
              );
          case 'ERROR':
              return (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-500/30 rounded-full">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Error</span>
                  </div>
              );
          default:
              return (
                  <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-white/5 rounded-full">
                      <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Ready</span>
                  </div>
              );
      }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white relative">
      
      {/* Toast Notification: Success */}
      {showSaveConfirm && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 fade-in">
              <Check size={18} strokeWidth={3} />
              <span className="font-bold text-sm">Session Saved</span>
          </div>
      )}

      {/* Toast Notification: Error */}
      {errorMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600/90 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in max-w-[90%] border border-red-400/50">
              <AlertCircle size={24} className="flex-shrink-0" />
              <div>
                  <p className="font-bold text-sm">Recording Failed</p>
                  <p className="text-xs opacity-90">{errorMessage}</p>
              </div>
              <button onClick={() => setErrorMessage(null)} className="ml-2 p-1 hover:bg-white/20 rounded-full">
                  <X size={16} />
              </button>
          </div>
      )}

      {/* 1. Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-zinc-900/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
              {onBack && (
                  <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                      <ChevronLeft className="text-white" />
                  </button>
              )}
              <div>
                  <h1 className="font-bold text-base leading-tight">Simultaneous</h1>
                  <div className="flex items-center gap-1.5 opacity-60">
                      <Globe size={10} />
                      <span className="text-[10px] uppercase tracking-wide">Stream Pipeline</span>
                  </div>
              </div>
          </div>
          
          <div className="flex items-center gap-2">
               {renderStatusIndicator()}
               <button className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white">
                   <MoreVertical size={20} />
               </button>
          </div>
      </div>

      {/* 2. Top Actions Bar */}
      <div className="px-4 py-3 bg-black flex items-center justify-between border-b border-white/5">
          <button 
            onClick={toggleMute}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors border
                ${isMuted 
                    ? 'bg-zinc-900 text-zinc-500 border-zinc-800' 
                    : 'bg-blue-900/20 text-blue-400 border-blue-500/20'}
            `}
          >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {isMuted ? 'Muted' : 'Audio On'}
          </button>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={handleSave}
                disabled={sourceSegments.length === 0}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-xs font-bold text-zinc-300 transition-colors border border-white/5"
            >
                <Save size={14} />
            </button>
            <button 
                onClick={stopSession}
                disabled={status === 'IDLE'}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-red-900/20 hover:text-red-400 disabled:opacity-50 text-xs font-bold text-zinc-300 transition-colors border border-white/5"
            >
                <RefreshCw size={14} />
            </button>
          </div>
      </div>

      {/* 3. Split Panels */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* Source Panel (Top) */}
          <div className="flex-1 bg-zinc-900/50 p-6 overflow-y-auto border-b border-white/5 relative group">
              <div className="sticky top-0 left-0 z-10 mb-4">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/80 px-2 py-1 rounded backdrop-blur-sm border border-white/5">
                      {sourceLanguage} (Original)
                  </span>
              </div>
              
              <div className="space-y-4">
                  {sourceSegments.length === 0 && status === 'LISTENING' && (
                      <p className="text-zinc-600 italic text-sm animate-pulse">Listening for speech...</p>
                  )}
                  {sourceSegments.map((seg) => (
                      <p key={seg.id} className={`text-lg font-medium leading-relaxed transition-opacity duration-300 ${seg.isFinal ? 'text-zinc-300 opacity-100' : 'text-zinc-500 opacity-70'}`}>
                          {seg.text}
                      </p>
                  ))}
                  <div ref={sourceEndRef} className="h-4" />
              </div>
          </div>

          {/* Translated Panel (Bottom) */}
          <div className="flex-1 bg-black p-6 overflow-y-auto relative">
              <div className="sticky top-0 left-0 z-10 mb-4 flex justify-between">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-900/20 px-2 py-1 rounded backdrop-blur-sm border border-blue-500/20">
                      {targetLanguage} (Translated)
                  </span>
                  {!isMuted && status === 'LISTENING' && (
                      <div className="flex items-center gap-1">
                          <span className="w-0.5 h-2 bg-blue-500 animate-pulse"></span>
                          <span className="w-0.5 h-3 bg-blue-500 animate-pulse delay-75"></span>
                          <span className="w-0.5 h-2 bg-blue-500 animate-pulse delay-150"></span>
                      </div>
                  )}
              </div>
              
               <div className="space-y-4">
                  {translatedSegments.map((seg) => (
                      <p key={seg.id} className="text-white text-xl font-medium leading-relaxed animate-in fade-in slide-in-from-right-2 duration-300">
                          {seg.text}
                      </p>
                  ))}
                  
                  {/* Loading indicator when waiting for translation */}
                  {sourceSegments.some(s => s.isFinal && !translatedSegments.find(t => t.id === s.id)) && (
                      <div className="flex gap-1 mt-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></span>
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></span>
                      </div>
                  )}
                  <div ref={targetEndRef} className="h-12" />
              </div>
          </div>

          {/* Floating Mic Button & Visualizer */}
          <div className="absolute bottom-6 left-0 w-full flex flex-col items-center pointer-events-none z-30 gap-4">
              
              {/* Audio Visualizer (Real Data) */}
              {status === 'LISTENING' && (
                  <div className="flex items-center gap-1 h-8">
                       {[1, 2, 3, 4, 5].map((i) => (
                           <div 
                                key={i}
                                className="w-1.5 bg-green-500 rounded-full transition-all duration-75"
                                style={{ 
                                    height: `${Math.max(20, Math.min(100, audioLevel * (Math.random() + 0.5)))}%`,
                                    opacity: audioLevel > 10 ? 1 : 0.3
                                }}
                           />
                       ))}
                  </div>
              )}

              <button 
                onClick={toggleSession}
                className={`
                    pointer-events-auto w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95
                    ${status === 'LISTENING' 
                        ? 'bg-red-500 text-white shadow-red-900/50' 
                        : status === 'PAUSED'
                            ? 'bg-yellow-500 text-black shadow-yellow-900/50'
                            : status === 'ERROR'
                                ? 'bg-zinc-800 text-red-500 border border-red-500/50'
                                : 'bg-blue-600 text-white shadow-blue-900/50'}
                `}
              >
                  {status === 'LISTENING' ? (
                      <Pause size={28} fill="currentColor" />
                  ) : status === 'PAUSED' ? (
                      <Play size={28} fill="currentColor" className="ml-1" />
                  ) : status === 'ERROR' ? (
                      <RefreshCw size={28} />
                  ) : (
                      <Mic size={28} />
                  )}
              </button>
          </div>
      </div>

      {/* 4. Language Selectors (Footer) */}
      <div className="h-16 bg-zinc-900 border-t border-white/10 flex items-center justify-between px-6 z-20">
           <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
               <span className="text-sm font-bold">{sourceLanguage}</span>
               <div className="bg-white/10 p-1 rounded">
                   <RefreshCw size={12} />
               </div>
           </button>

           <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
               Real-Time Mode
           </div>

           <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
               <div className="bg-blue-500/10 p-1 rounded border border-blue-500/20">
                   <RefreshCw size={12} />
               </div>
               <span className="text-sm font-bold">{targetLanguage}</span>
           </button>
      </div>
    </div>
  );
};
