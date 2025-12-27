
import React, { useState, useRef, useEffect } from 'react';
import { Mic, ChevronDown, RotateCcw, ArrowRightLeft, Volume2 } from 'lucide-react';
import { Button } from './ui/Button';
import { aiGateway } from '../services/aiGateway';
import { analytics } from '../services/analyticsService';
import { TranslationMessage } from '../types';

interface ConversationTranslatorProps {
    onBack?: () => void;
}

const LANGUAGES = ['English', 'Vietnamese', 'Spanish', 'Japanese', 'Korean', 'Chinese'];

export const ConversationTranslator: React.FC<ConversationTranslatorProps> = ({ onBack }) => {
    const [langA, setLangA] = useState('English');
    const [langB, setLangB] = useState('Vietnamese');
    const [messages, setMessages] = useState<TranslationMessage[]>([]);
    
    // 'idle' | 'recordingA' | 'recordingB' | 'processing'
    const [state, setState] = useState<string>('idle'); 
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSwapLanguages = () => {
        setLangA(langB);
        setLangB(langA);
    };

    const handleRecord = async (speaker: 'A' | 'B') => {
        if (state !== 'idle') return;

        setState(speaker === 'A' ? 'recordingA' : 'recordingB');
        
        // Log start
        const sourceLang = speaker === 'A' ? langA : langB;
        const targetLang = speaker === 'A' ? langB : langA;
        analytics.logTranslation('start', 'conversation', `${sourceLang}-${targetLang}`);

        // Simulate Recording Duration (In real app, we'd use MediaRecorder)
        // Here we just wait 2 seconds to simulate "Push-to-talk" or fixed duration for mock
        setTimeout(async () => {
            setState('processing');
            
            try {
                // Mock Audio Blob
                const mockBlob = new Blob(["mock_audio"], { type: "audio/wav" });
                
                // 1. STT
                const originalText = await aiGateway.sttOnce(mockBlob);
                
                // 2. Translate
                const translatedText = await aiGateway.translate(originalText, sourceLang, targetLang);

                const newMessage: TranslationMessage = {
                    id: Date.now().toString(),
                    speaker,
                    originalText,
                    translatedText,
                    timestamp: Date.now(),
                    language: sourceLang
                };

                setMessages(prev => [...prev, newMessage]);
            } catch (e) {
                console.error("Translation failed", e);
            } finally {
                setState('idle');
            }
        }, 2000);
    };

    const renderMessage = (msg: TranslationMessage) => {
        const isA = msg.speaker === 'A';
        return (
            <div key={msg.id} className={`flex flex-col ${isA ? 'items-start' : 'items-end'} mb-6`}>
                <div className="flex items-center gap-2 mb-1">
                     <span className={`text-[10px] font-bold uppercase ${isA ? 'text-blue-400' : 'text-purple-400'}`}>
                        {isA ? langA : langB}
                     </span>
                </div>
                
                <div className={`
                    max-w-[85%] rounded-2xl p-4 relative overflow-hidden group
                    ${isA ? 'bg-zinc-900 rounded-tl-sm border border-white/5' : 'bg-zinc-800 rounded-tr-sm border border-white/5'}
                `}>
                    {/* Original */}
                    <p className="text-white text-base font-medium mb-2">{msg.originalText}</p>
                    
                    {/* Divider */}
                    <div className="w-full h-px bg-white/10 mb-2"></div>
                    
                    {/* Translated */}
                    <div className="flex items-start gap-2">
                        <p className={`text-sm ${isA ? 'text-blue-200' : 'text-purple-200'}`}>
                            {msg.translatedText}
                        </p>
                    </div>

                    {/* Play Button Overlay */}
                    <button className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 text-white">
                        <Volume2 size={12} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-black">
            {/* Header: Language Selector */}
            <div className="h-16 flex items-center justify-between px-4 bg-zinc-900 border-b border-white/10 sticky top-0 z-10">
                <div className="flex-1 flex justify-center">
                    <button className="flex items-center gap-1 text-blue-400 font-bold text-sm bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                        {langA} <ChevronDown size={14} />
                    </button>
                </div>

                <button onClick={handleSwapLanguages} className="p-2 rounded-full bg-black border border-white/10 text-zinc-400 hover:text-white mx-2">
                    <ArrowRightLeft size={16} />
                </button>

                <div className="flex-1 flex justify-center">
                    <button className="flex items-center gap-1 text-purple-400 font-bold text-sm bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
                        {langB} <ChevronDown size={14} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-32 no-scrollbar bg-black">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-4 opacity-50">
                        <ArrowRightLeft size={48} strokeWidth={1} />
                        <p className="text-sm">Tap a microphone to start translating</p>
                    </div>
                ) : (
                    messages.map(renderMessage)
                )}
                {state === 'processing' && (
                     <div className="flex w-full justify-center my-4">
                        <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full border border-white/5">
                            <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></span>
                        </div>
                     </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Controls */}
            <div className="h-32 bg-black border-t border-white/10 px-6 flex items-center justify-between gap-6 pb-safe-bottom">
                
                {/* Mic A */}
                <button
                    disabled={state !== 'idle'}
                    onClick={() => handleRecord('A')}
                    className={`
                        flex-1 h-20 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border
                        ${state === 'recordingA' 
                            ? 'bg-blue-500 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.4)]' 
                            : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'}
                        disabled:opacity-50
                    `}
                >
                    <Mic className={`w-6 h-6 ${state === 'recordingA' ? 'text-white animate-pulse' : 'text-blue-400'}`} />
                    <span className={`text-xs font-bold uppercase ${state === 'recordingA' ? 'text-white' : 'text-zinc-500'}`}>
                        {state === 'recordingA' ? 'Listening...' : langA}
                    </span>
                </button>

                {/* Reset / Status */}
                <button 
                    onClick={() => setMessages([])}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
                >
                    <RotateCcw size={16} />
                </button>

                {/* Mic B */}
                <button
                    disabled={state !== 'idle'}
                    onClick={() => handleRecord('B')}
                    className={`
                        flex-1 h-20 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border
                        ${state === 'recordingB' 
                            ? 'bg-purple-500 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.4)]' 
                            : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'}
                        disabled:opacity-50
                    `}
                >
                    <Mic className={`w-6 h-6 ${state === 'recordingB' ? 'text-white animate-pulse' : 'text-purple-400'}`} />
                    <span className={`text-xs font-bold uppercase ${state === 'recordingB' ? 'text-white' : 'text-zinc-500'}`}>
                        {state === 'recordingB' ? 'Listening...' : langB}
                    </span>
                </button>

            </div>
        </div>
    );
};
