
import React, { useState, useEffect } from 'react';
import { 
    Bot, ScanEye, Languages, Mic, ChevronRight, Sparkles, 
    BrainCircuit, Aperture, MessageSquareText, ShoppingBag, 
    Timer, Rocket, Star, ShieldCheck, Zap
} from 'lucide-react';
import { useDeviceService } from '../services/DeviceContext';

interface AIHubProps {
    onNavigate: (tab: string, params?: any) => void;
}

export const AIHub: React.FC<AIHubProps> = ({ onNavigate }) => {
    const deviceService = useDeviceService();
    const [isConnected, setIsConnected] = useState(deviceService.status === 'CONNECTED');

    useEffect(() => {
        const unsub = deviceService.subscribe('status', (s) => setIsConnected(s === 'CONNECTED'));
        return () => unsub();
    }, [deviceService]);

    return (
        <div className="h-full bg-black text-white flex flex-col overflow-y-auto no-scrollbar pb-32">
            
            {/* Header - Dynamic Title */}
            <div className="px-6 pt-12 pb-8 bg-black/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                        <Sparkles size={16} className="text-white animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                        {isConnected ? 'Mercy Intelligence' : 'Mercy Ecosystem'}
                    </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tighter">
                    {isConnected ? (
                        <>AI <span className="opacity-40">Hub</span></>
                    ) : (
                        <>Mercy <span className="opacity-40">Store</span></>
                    )}
                </h1>
            </div>

            {/* Content Logic */}
            {!isConnected ? (
                /* GUEST VIEW: Store First */
                <div className="animate-in fade-in duration-700">
                    <div className="px-6 py-8">
                        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                                <ShoppingBag size={120} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Nâng cấp thiết bị</h3>
                            <p className="text-sm text-white/70 mb-6 leading-relaxed">Sở hữu ngay Mercy Glasses Pro để trải nghiệm toàn bộ tính năng AI vượt trội.</p>
                            <button className="bg-white text-black px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest active:scale-95 transition-all">Mua ngay</button>
                        </div>

                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 ml-1 opacity-50">Ecosystem Products</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <StoreLargeItem 
                                img="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600"
                                name="Mercy Glasses Pro"
                                price="12.990.000đ"
                                desc="Màn hình HUD, Camera AI 4K, Âm thanh truyền xương."
                            />
                            <StoreLargeItem 
                                img="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
                                name="Mercy Watch Elite"
                                price="8.990.000đ"
                                desc="Điều khiển cử chỉ, theo dõi sức khỏe chuyên sâu."
                            />
                        </div>
                    </div>
                </div>
            ) : (
                /* CONNECTED VIEW: AI Modules First */
                <div className="animate-in fade-in duration-700">
                    {/* Hero Banner: New AI Model */}
                    <div className="px-6 py-8">
                        <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 relative overflow-hidden group">
                            <div className="absolute top-4 right-4 text-purple-500/20 group-hover:rotate-12 transition-transform duration-500">
                                <BrainCircuit size={80} />
                            </div>
                            <div className="inline-block px-3 py-1 bg-white/5 rounded-full border border-white/10 self-start">
                                <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">New Model Available</span>
                            </div>
                            <h3 className="text-3xl font-bold tracking-tight">Gemini 2.5 Flash</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed max-w-[80%]">Experience the next generation of multimodal reasoning. Faster, smarter, and more capable.</p>
                            <button onClick={() => onNavigate('assistant')} className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest group">
                                Open Chat <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Section 1: Active AI Modules */}
                    <div className="px-6 mb-12">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 ml-1 opacity-50">Active AI Modules</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <HubFeature 
                                icon={Languages} 
                                title="Live Translate" 
                                desc="Voice-to-Voice 2.0" 
                                onClick={() => onNavigate('translate')}
                                active
                                color="text-blue-400"
                            />
                            <HubFeature 
                                icon={ScanEye} 
                                title="Vision AI" 
                                desc="Object Recognition" 
                                onClick={() => onNavigate('vision')}
                                active
                                color="text-cyan-400"
                            />
                            <HubFeature 
                                icon={Bot} 
                                title="Robot Control" 
                                desc="External Entities" 
                                onClick={() => onNavigate('robot')}
                                active
                                color="text-purple-400"
                            />
                            <HubFeature 
                                icon={Mic} 
                                title="Voice Mode" 
                                desc="Hands-free Control" 
                                onClick={() => onNavigate('assistant')}
                                active
                                color="text-green-400"
                            />
                        </div>
                    </div>

                    {/* Section 2: Coming Soon */}
                    <div className="px-6 mb-12">
                        <div className="bg-zinc-900/40 border border-white/10 rounded-[2.5rem] p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Rocket size={18} className="text-blue-400" />
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Beta Tools</h3>
                            </div>
                            <div className="space-y-4">
                                <BetaItem 
                                    icon={MessageSquareText} 
                                    title="Tóm tắt hội thoại" 
                                    desc="Gemini 2.5 Pro integration" 
                                    date="Q3 2024"
                                />
                                <BetaItem 
                                    icon={BrainCircuit} 
                                    title="AI Personal Trainer" 
                                    desc="Dựa trên thói quen vận động" 
                                    date="Q4 2024"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Footer (Always Show) */}
            <div className="px-6 mt-4">
                <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-[2rem] flex items-center gap-4">
                    <ShieldCheck size={28} className="text-blue-500/50" />
                    <div>
                        <h4 className="text-xs font-bold text-blue-200">Bảo mật Mercy OS</h4>
                        <p className="text-[10px] text-zinc-600 leading-relaxed mt-1">Dữ liệu AI của bạn được xử lý cục bộ và mã hóa đầu cuối trên thiết bị.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StoreLargeItem = ({ img, name, price, desc }: any) => (
    <div className="bg-zinc-900 border border-white/5 rounded-[2rem] overflow-hidden group active:scale-[0.98] transition-all">
        <div className="h-48 overflow-hidden relative">
            <img src={img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="text-[10px] font-bold text-white">{price}</span>
            </div>
        </div>
        <div className="p-6">
            <h4 className="text-base font-bold mb-1">{name}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const HubFeature = ({ icon: Icon, title, desc, onClick, active, color }: any) => (
    <button onClick={onClick} className="w-full text-left p-5 bg-zinc-900/60 border border-white/5 rounded-[2rem] hover:bg-zinc-800 transition-all group active:scale-95">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${active ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-500'}`}>
            <Icon size={24} className={color} />
        </div>
        <h4 className="text-[13px] font-bold mb-1">{title}</h4>
        <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black opacity-60">{desc}</p>
    </button>
);

const BetaItem = ({ icon: Icon, title, desc, date }: any) => (
    <div className="flex items-center justify-between group cursor-pointer">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-zinc-600 group-hover:text-white transition-colors">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-xs font-bold text-zinc-200">{title}</p>
                <p className="text-[9px] text-zinc-500 mt-0.5">{desc}</p>
            </div>
        </div>
        <div className="px-2 py-1 bg-zinc-800 rounded text-[8px] font-black text-zinc-500 border border-white/5 group-hover:text-blue-400 group-hover:border-blue-400/20 transition-all">
            {date}
        </div>
    </div>
);
