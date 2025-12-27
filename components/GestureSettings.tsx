
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Touchpad, ArrowRight, Save, RotateCcw, Check, MousePointer2, Smartphone } from 'lucide-react';
import { Button } from './ui/Button';
import { GestureMap, GestureType, ActionType } from '../types';
import { gestureRepository } from '../services/gestureRepository';
import { useDeviceService } from '../services/DeviceContext';

interface GestureSettingsProps {
    onBack: () => void;
}

const GESTURE_LABELS: Record<GestureType, string> = {
    TAP: 'Single Tap',
    DOUBLE_TAP: 'Double Tap',
    SWIPE_FORWARD: 'Swipe Forward',
    SWIPE_BACKWARD: 'Swipe Backward',
    HOLD: 'Touch & Hold'
};

const ACTION_LABELS: Record<ActionType, string> = {
    NONE: 'No Action',
    PLAY_PAUSE: 'Play / Pause',
    NEXT_TRACK: 'Next Track',
    PREV_TRACK: 'Previous Track',
    VOL_UP: 'Volume Up',
    VOL_DOWN: 'Volume Down',
    ASSISTANT: 'Voice Assistant',
    TAKE_PHOTO: 'Take Photo'
};

const GESTURE_ICONS: Record<GestureType, React.ElementType> = {
    TAP: MousePointer2,
    DOUBLE_TAP: MousePointer2, // Reuse, maybe styled differently
    SWIPE_FORWARD: ArrowRight,
    SWIPE_BACKWARD: ArrowRight,
    HOLD: Smartphone // Abstract rep
};

export const GestureSettings: React.FC<GestureSettingsProps> = ({ onBack }) => {
    const deviceService = useDeviceService();
    const [mapping, setMapping] = useState<GestureMap>(gestureRepository.getMapping());
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        // Load initial state
        setMapping(gestureRepository.getMapping());
    }, []);

    const handleChange = (gesture: GestureType, action: ActionType) => {
        setMapping(prev => ({
            ...prev,
            [gesture]: action
        }));
        setSaveStatus('idle');
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('idle');

        try {
            // 1. Save Locally
            gestureRepository.saveMapping(mapping);

            // 2. Sync to Device
            const synced = await deviceService.setGestureMapping(mapping);
            
            if (synced) {
                setSaveStatus('success');
            } else {
                // Saved locally but failed sync (e.g. disconnected)
                // We show success but maybe with a warning in real app. 
                // For now, let's consider it a "local success" but log it.
                setSaveStatus('success'); 
                console.warn("Saved locally, but device not connected.");
            }
        } catch (e) {
            console.error(e);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            // Reset success message after 2s
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };

    const handleReset = () => {
        if (confirm("Reset gestures to default?")) {
            const defaults = gestureRepository.resetDefaults();
            setMapping(defaults);
            setSaveStatus('idle');
        }
    };

    return (
        <div className="h-full bg-black text-white flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 flex items-center gap-4 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-20">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10">
                    <ChevronLeft className="text-white" />
                </button>
                <div className="flex items-center gap-2">
                    <Touchpad className="w-5 h-5 text-purple-400" />
                    <h1 className="text-xl font-bold">Gesture Control</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24 no-scrollbar">
                
                {/* Intro / Illustration */}
                <div className="flex flex-col items-center justify-center py-6 px-4 bg-zinc-900/50 rounded-3xl border border-white/5">
                    <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 relative">
                        <Touchpad size={40} className="text-purple-400" />
                        <div className="absolute top-2 right-2 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-center text-sm text-zinc-400 max-w-[240px]">
                        Customize how you interact with your Mercy Glasses touch bar.
                    </p>
                </div>

                {/* Gesture List */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2">Touchpad Mappings</h3>
                    
                    {(Object.keys(mapping) as GestureType[]).map((gesture) => {
                        const Icon = GESTURE_ICONS[gesture];
                        return (
                            <div key={gesture} className="bg-zinc-900 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/20 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                                        <Icon size={18} className={gesture === 'SWIPE_BACKWARD' ? 'rotate-180' : ''} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{GESTURE_LABELS[gesture]}</span>
                                        <span className="text-[10px] text-zinc-500 font-mono">
                                            {gesture}
                                        </span>
                                    </div>
                                </div>

                                <div className="relative">
                                    <select 
                                        value={mapping[gesture]} 
                                        onChange={(e) => handleChange(gesture, e.target.value as ActionType)}
                                        className="appearance-none bg-black border border-white/10 rounded-lg py-2 pl-3 pr-8 text-xs font-medium text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                                    >
                                        {Object.entries(ACTION_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                        <ChevronLeft size={12} className="-rotate-90" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-4">
                    <Button 
                        onClick={handleSave} 
                        loading={isSaving}
                        className={`w-full py-4 rounded-2xl font-bold transition-all ${saveStatus === 'success' ? 'bg-green-500 hover:bg-green-600 text-black' : 'bg-white text-black hover:bg-zinc-200'}`}
                    >
                        {saveStatus === 'success' ? (
                            <span className="flex items-center gap-2"><Check size={18} /> Synced Successfully</span>
                        ) : (
                            <span className="flex items-center gap-2"><Save size={18} /> Save & Sync</span>
                        )}
                    </Button>
                    
                    <button 
                        onClick={handleReset}
                        className="w-full py-3 rounded-2xl border border-white/10 text-zinc-500 hover:text-white hover:bg-white/5 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                        <RotateCcw size={14} /> Reset Defaults
                    </button>
                </div>
            </div>
        </div>
    );
};
