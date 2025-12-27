
import React, { useEffect, useState } from 'react';
import { PAYWALL_EVENT } from '../services/quotaService';
import { X, Zap, Check, CreditCard, Crown } from 'lucide-react';
import { Button } from './ui/Button';

export const PaywallModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState<string>('');

    useEffect(() => {
        const handleTrigger = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setReason(detail?.reason || "Limit Reached");
            setIsOpen(true);
        };

        window.addEventListener(PAYWALL_EVENT, handleTrigger);
        return () => window.removeEventListener(PAYWALL_EVENT, handleTrigger);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-zinc-900 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/40 animate-in zoom-in-95 duration-300">
                {/* Decorative header */}
                <div className="h-32 bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-white/10">
                        <Crown size={140} />
                    </div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
                    
                    <div className="absolute bottom-6 left-6 text-white">
                        <span className="bg-black/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                            {reason}
                        </span>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Mercy <span className="text-purple-200">Pro</span>
                        </h2>
                    </div>
                    
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors backdrop-blur-md"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-zinc-400 text-sm mb-6 text-center">
                        You've hit the limit for the free tier. Upgrade to unlock unlimited AI processing and advanced features.
                    </p>

                    <div className="space-y-3 mb-8">
                        <FeatureRow text="Unlimited Translations" />
                        <FeatureRow text="4K Vision Analysis" />
                        <FeatureRow text="Priority Support" />
                    </div>

                    <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-4 rounded-xl mb-3 shadow-lg shadow-white/10">
                        <Zap className="w-4 h-4 mr-2 fill-black" /> Upgrade Now
                    </Button>
                    
                    <button onClick={() => setIsOpen(false)} className="w-full text-zinc-500 text-xs font-medium hover:text-white transition-colors">
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};

const FeatureRow = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3 text-sm text-zinc-300">
        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check size={12} className="text-green-500" />
        </div>
        {text}
    </div>
);
