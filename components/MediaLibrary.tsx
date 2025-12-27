import React, { useState, useEffect } from 'react';
import { MediaItem, MediaType } from '../types';
import { albumRepository } from '../services/albumRepository';
import { useDeviceService } from '../services/DeviceContext';
import { Play, Image as ImageIcon, Video, Music, Filter, Loader2, Glasses, CloudOff, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { MediaViewer } from './MediaViewer';

// Mock initial data for offline state
const MOCK_MEDIA: MediaItem[] = [
    { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop', timestamp: Date.now() - 100000, location: 'Tokyo, Japan', aiDescription: 'Coding on laptop', isDownloaded: true },
    { id: '2', type: 'video', url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&auto=format&fit=crop', timestamp: Date.now() - 200000, location: 'Mount Fuji', aiDescription: 'Mountain Hike', isDownloaded: true },
];

export const MediaLibrary: React.FC = () => {
    const deviceService = useDeviceService();
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | MediaType>('all');
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // Initial Load
    useEffect(() => {
        loadAlbum();
    }, [deviceService.status]);

    const loadAlbum = async () => {
        setLoading(true);
        const items = await albumRepository.getAlbumMedia();
        if (items.length === 0 && deviceService.status !== 'CONNECTED') {
             // Fallback if empty repo and disconnected (just to show UI for demo)
             setMedia(MOCK_MEDIA);
        } else {
             setMedia(items);
        }
        setLoading(false);
    };

    const handleRefresh = async () => {
        setIsSyncing(true);
        await new Promise(r => setTimeout(r, 1000)); // Min loader time
        await loadAlbum();
        setIsSyncing(false);
    };

    const filteredMedia = media.filter(item => {
        if (filter === 'all') return true;
        return item.type === filter;
    });

    const getIconForType = (type: MediaType) => {
        switch (type) {
            case 'video': return <Video className="w-4 h-4 text-white drop-shadow-md" />;
            case 'audio': return <Music className="w-4 h-4 text-white drop-shadow-md" />;
            default: return null;
        }
    };

    const Filters = () => (
        <div className="flex gap-2 px-6 pb-4 overflow-x-auto no-scrollbar">
            {['all', 'image', 'video', 'audio'].map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`
                        px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all border
                        ${filter === f 
                            ? 'bg-white text-black border-white' 
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600'}
                    `}
                >
                    {f === 'all' ? 'All Media' : f + 's'}
                </button>
            ))}
        </div>
    );

    return (
        <div className="h-full bg-black text-white flex flex-col relative">
            {/* Header */}
            <div className="px-6 pt-6 pb-2 bg-black/90 backdrop-blur-md sticky top-0 z-10 flex flex-col gap-4 border-b border-white/5">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Mercy Gallery</h1>
                        <p className="text-xs text-zinc-500 flex items-center gap-2">
                             {media.length} Items
                             {deviceService.status === 'CONNECTED' 
                                ? <span className="text-green-500 flex items-center gap-1">• Connected</span>
                                : <span className="text-zinc-600 flex items-center gap-1">• <CloudOff className="w-3 h-3"/> Offline</span>
                             }
                        </p>
                    </div>
                    <button 
                        onClick={handleRefresh}
                        disabled={isSyncing}
                        className={`w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-zinc-800 ${isSyncing ? 'animate-spin text-blue-500' : 'text-zinc-400'}`}
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="pt-4 bg-black/90 z-10 sticky top-[80px]">
                <Filters />
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-1 no-scrollbar">
                {loading ? (
                    <div className="h-40 flex items-center justify-center text-zinc-500 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-0.5 min-h-[50vh]">
                        {filteredMedia.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedItem(item)}
                                className="relative aspect-square bg-zinc-900 overflow-hidden cursor-pointer group"
                            >
                                {item.type === 'audio' ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center mb-2">
                                            <Music className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <span className="text-[9px] text-zinc-400 font-mono">AUDIO</span>
                                    </div>
                                ) : (
                                    <>
                                        <img src={item.url} alt={item.aiDescription} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute top-1 right-1">
                                            {getIconForType(item.type)}
                                        </div>
                                    </>
                                )}
                                
                                {item.isDownloaded && (
                                    <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                
                {!loading && filteredMedia.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-500 opacity-60">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p>No media found.</p>
                    </div>
                )}
            </div>

            {/* Viewer Modal (Detail Screen) */}
            {selectedItem && (
                <MediaViewer 
                    item={selectedItem} 
                    onClose={() => setSelectedItem(null)} 
                    onDownloadComplete={() => loadAlbum()} // Refresh list to show saved status
                />
            )}
        </div>
    );
};