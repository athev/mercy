
import React, { useState, useEffect } from 'react';
import { TranslationSession } from '../types';
import { translationHistoryRepository } from '../services/translationHistoryRepository';
import { ChevronLeft, Calendar, Clock, Trash2, FileAudio, ArrowRight, ArrowRightLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';

interface TranslationHistoryProps {
    onBack: () => void;
}

export const TranslationHistory: React.FC<TranslationHistoryProps> = ({ onBack }) => {
    const [sessions, setSessions] = useState<TranslationSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<TranslationSession | null>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        setSessions(translationHistoryRepository.getSessions());
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Delete this recording?")) {
            translationHistoryRepository.deleteSession(id);
            loadHistory();
            if (selectedSession?.id === id) setSelectedSession(null);
        }
    };

    const formatDate = (ts: number) => {
        return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (start: number, end: number) => {
        const diff = Math.max(0, end - start);
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Detail View ---
    if (selectedSession) {
        return (
            <div className="h-full bg-black text-white flex flex-col animate-in slide-in-from-right duration-300">
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-zinc-900/80 backdrop-blur-md">
                    <button onClick={() => setSelectedSession(null)} className="p-2 -ml-2 rounded-full hover:bg-white/10">
                        <ChevronLeft className="text-white" />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-sm">Session Detail</span>
                        <span className="text-[10px] text-zinc-500">{formatDate(selectedSession.startTime)}</span>
                    </div>
                    <div className="w-8"></div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Meta Info */}
                    <div className="p-4 bg-zinc-900/50 border-b border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold border border-blue-500/20">
                                 {selectedSession.sourceLang}
                             </div>
                             <ArrowRight className="w-4 h-4 text-zinc-600" />
                             <div className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-xs font-bold border border-purple-500/20">
                                 {selectedSession.targetLang}
                             </div>
                         </div>
                         <div className="flex items-center gap-2 text-zinc-500 text-xs">
                             <Clock className="w-3 h-3" />
                             {formatDuration(selectedSession.startTime, selectedSession.endTime)}
                         </div>
                    </div>

                    {/* Audio Player Mock */}
                    {selectedSession.audioPath && (
                        <div className="px-4 py-3 bg-zinc-900 border-b border-white/5 flex items-center gap-3">
                            <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:bg-zinc-200">
                                <span className="ml-1">▶</span>
                            </button>
                            <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                                <div className="w-1/3 h-full bg-blue-500"></div>
                            </div>
                            <span className="text-xs font-mono text-zinc-400">00:12 / {formatDuration(selectedSession.startTime, selectedSession.endTime)}</span>
                        </div>
                    )}

                    {/* Transcripts */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-12">
                         {selectedSession.sourceTranscript.map((seg) => {
                             const translated = selectedSession.translatedTranscript.find(t => t.id === seg.id);
                             return (
                                 <div key={seg.id} className="flex flex-col gap-2 mb-6">
                                     <div className="p-3 bg-zinc-900 rounded-xl rounded-tl-none border border-white/5 self-start max-w-[90%]">
                                         <p className="text-zinc-300 text-sm leading-relaxed">{seg.text}</p>
                                     </div>
                                     {translated && (
                                         <div className="p-3 bg-blue-900/20 rounded-xl rounded-tr-none border border-blue-500/20 self-end max-w-[90%]">
                                             <p className="text-white text-base font-medium leading-relaxed">{translated.text}</p>
                                         </div>
                                     )}
                                 </div>
                             );
                         })}
                    </div>
                </div>
            </div>
        );
    }

    // --- List View ---
    return (
        <div className="h-full bg-black text-white flex flex-col animate-in slide-in-from-right duration-300">
            <div className="h-16 flex items-center gap-4 px-4 border-b border-white/10 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10">
                    <ChevronLeft className="text-white" />
                </button>
                <h1 className="font-bold text-lg">History</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-600 space-y-3">
                        <FileAudio size={48} strokeWidth={1} />
                        <p className="text-sm">No recorded sessions yet.</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <button 
                            key={session.id}
                            onClick={() => setSelectedSession(session)}
                            className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-zinc-800 transition-all active:scale-[0.99]"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center border border-blue-500/10">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm text-zinc-200">{session.sourceLang}</span>
                                        <ArrowRight className="w-3 h-3 text-zinc-600" />
                                        <span className="font-bold text-sm text-zinc-200">{session.targetLang}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <span>{formatDate(session.startTime)}</span>
                                        <span>•</span>
                                        <span>{formatDuration(session.startTime, session.endTime)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div onClick={(e) => handleDelete(e, session.id)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors">
                                    <Trash2 size={16} />
                                </div>
                                <ChevronRight size={16} className="text-zinc-600 group-hover:text-white" />
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};
