import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { Play, Download, CheckCircle, Share2, X, Music, Volume2, Film } from 'lucide-react';
import { albumRepository } from '../services/albumRepository';

interface MediaViewerProps {
    item: MediaItem;
    onClose: () => void;
    onDownloadComplete?: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({ item, onClose, onDownloadComplete }) => {
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDownloaded, setIsDownloaded] = useState(item.isDownloaded || false);

    useEffect(() => {
        // Check actual status from repo in case prop is stale
        const local = albumRepository.getLocalMedia();
        if (local.find(i => i.id === item.id)) setIsDownloaded(true);
    }, [item]);

    const handleDownload = async () => {
        if (isDownloaded || downloading) return;
        setDownloading(true);
        try {
            await albumRepository.saveToLocal(item, (p) => setProgress(p));
            setIsDownloaded(true);
            if (onDownloadComplete) onDownloadComplete();
        } catch (e) {
            console.error(e);
        } finally {
            setDownloading(false);
        }
    };

    const renderContent = () => {
        if (item.type === 'video') {
            return (
                <div className="w-full h-full flex items-center justify-center bg-black relative">
                     <img src={item.url} className="max-w-full max-h-full opacity-50 blur-sm" alt="Video Thumb" />
                     <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 hover:scale-110 transition-transform cursor-pointer">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                        <p className="mt-4 text-zinc-400 text-sm font-medium">Preview Mode</p>
                     </div>
                </div>
            );
        }
        if (item.type === 'audio') {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 relative p-8">
                     <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-900/30 mb-8 animate-pulse">
                        <Music className="w-16 h-16 text-white" />
                     </div>
                     
                     <h3 className="text-2xl font-bold mb-2">{item.aiDescription || 'Audio Recording'}</h3>
                     <p className="text-zinc-500 text-sm mb-8">{new Date(item.timestamp).toLocaleString()}</p>

                     {/* Fake Waveform */}
                     <div className="flex items-center gap-1 h-12 mb-8">
                        {[...Array(20)].map((_, i) => (
                            <div 
                                key={i} 
                                className="w-1.5 bg-zinc-700 rounded-full animate-pulse"
                                style={{ 
                                    height: `${Math.max(20, Math.random() * 100)}%`,
                                    animationDelay: `${i * 0.05}s` 
                                }}
                            ></div>
                        ))}
                     </div>

                     <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:bg-zinc-200 transition-colors">
                        <Play className="w-6 h-6 fill-black ml-1" />
                     </button>
                </div>
            );
        }
        // Image default
        return (
            <div className="flex-1 flex items-center justify-center p-0">
                <img src={item.url} alt="Full view" className="max-w-full max-h-full object-contain" />
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header / Actions */}
            <div className="p-4 flex justify-between items-center absolute top-0 w-full z-20 bg-gradient-to-b from-black/90 to-transparent">
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white/20 transition-colors">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex gap-3">
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white/20 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                        
                        <button 
                            onClick={handleDownload}
                            disabled={isDownloaded || downloading}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md transition-all font-medium text-sm
                                ${isDownloaded 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-white text-black hover:bg-zinc-200'}
                            `}
                        >
                            {downloading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                    {progress}%
                                </span>
                            ) : isDownloaded ? (
                                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Saved</span>
                            ) : (
                                <span className="flex items-center gap-2"><Download className="w-4 h-4" /> Save</span>
                            )}
                        </button>
                </div>
            </div>

            {/* Main Content Viewer */}
            {renderContent()}

            {/* Footer Metadata */}
            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-20">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg">
                        {item.type === 'video' ? <Film className="w-5 h-5 text-white" /> : 
                         item.type === 'audio' ? <Volume2 className="w-5 h-5 text-white" /> : 
                         <Share2 className="w-5 h-5 text-white" />} 
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight mb-1">{item.aiDescription || 'Untitled Media'}</h3>
                        <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
                            <span className="bg-white/10 px-2 py-0.5 rounded text-zinc-300">{item.location || 'Unknown Location'}</span>
                            <span>•</span>
                            <span>{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};