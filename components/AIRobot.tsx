
import React, { useState, useEffect } from 'react';
import { RobotTheme, RobotRoleType } from '../types';
import { ChevronLeft, Stethoscope, BookOpen, Gamepad2, Radio, Lock, Check, Cpu, Battery, Signal, Heart, Zap, Coffee, Frown, X } from 'lucide-react';

// Enhanced Themes with "Expression" types
const THEMES: RobotTheme[] = [
    { id: 'neutral', name: 'Neutral', previewUrl: '', isPremium: false },
    { id: 'happy', name: 'Happy', previewUrl: '', isPremium: false },
    { id: 'love', name: 'In Love', previewUrl: '', isPremium: false },
    { id: 'sleepy', name: 'Sleepy', previewUrl: '', isPremium: false },
    { id: 'angry', name: 'Angry', previewUrl: '', isPremium: true },
    { id: 'dizzy', name: 'System Error', previewUrl: '', isPremium: true },
];

interface AIRobotProps {
    onBack: () => void;
}

// Component to render the Robot's Face based on theme
const RobotFace = ({ themeId, scale = 1 }: { themeId: string, scale?: number }) => {
    // Dynamic sizing styles based on scale
    const eyeSize = { width: `${3 * scale}rem`, height: `${5 * scale}rem` }; // Standard pill eye
    const containerStyle = { gap: `${2 * scale}rem` };

    const renderFace = () => {
        switch (themeId) {
            case 'happy':
                return (
                    <div className="flex items-center justify-center" style={containerStyle}>
                        <div className="relative">
                            <div style={{ width: `${4 * scale}rem`, height: `${4 * scale}rem` }} className="border-t-4 sm:border-t-8 border-white rounded-t-full transform -translate-y-2"></div>
                             {/* Blush */}
                            <div className="absolute -bottom-4 -right-2 w-4 h-2 bg-pink-500/50 rounded-full blur-md"></div>
                        </div>
                        <div className="relative">
                            <div style={{ width: `${4 * scale}rem`, height: `${4 * scale}rem` }} className="border-t-4 sm:border-t-8 border-white rounded-t-full transform -translate-y-2"></div>
                            {/* Blush */}
                            <div className="absolute -bottom-4 -left-2 w-4 h-2 bg-pink-500/50 rounded-full blur-md"></div>
                        </div>
                    </div>
                );
            case 'love':
                return (
                    <div className="flex items-center justify-center" style={containerStyle}>
                        <Heart size={48 * scale} className="text-red-500 fill-red-500 animate-pulse" />
                        <Heart size={48 * scale} className="text-red-500 fill-red-500 animate-pulse delay-75" />
                    </div>
                );
            case 'sleepy':
                return (
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center" style={containerStyle}>
                            <div style={{ width: `${4 * scale}rem` }} className="h-1 sm:h-2 bg-blue-200 rounded-full"></div>
                            <div style={{ width: `${4 * scale}rem` }} className="h-1 sm:h-2 bg-blue-200 rounded-full"></div>
                        </div>
                        <div className="mt-4 animate-bounce text-blue-300 font-bold opacity-70" style={{ fontSize: `${1.5 * scale}rem` }}>
                            Zzz...
                        </div>
                    </div>
                );
            case 'angry':
                return (
                    <div className="flex items-center justify-center" style={containerStyle}>
                        <div className="relative">
                            <div style={{ width: eyeSize.width, height: `${3 * scale}rem` }} className="bg-white rounded-full transform rotate-12 mt-2"></div>
                            <div className="absolute -top-2 -left-2 w-full h-4 bg-black transform rotate-12"></div>
                        </div>
                        <div className="relative">
                            <div style={{ width: eyeSize.width, height: `${3 * scale}rem` }} className="bg-white rounded-full transform -rotate-12 mt-2"></div>
                             <div className="absolute -top-2 -left-2 w-full h-4 bg-black transform -rotate-12"></div>
                        </div>
                    </div>
                );
            case 'dizzy':
                return (
                    <div className="flex items-center justify-center" style={containerStyle}>
                        <X size={48 * scale} className="text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                        <X size={48 * scale} className="text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                );
            case 'neutral':
            default:
                return (
                    <div className="flex items-center justify-center" style={containerStyle}>
                        <div style={eyeSize} className="bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-pulse"></div>
                        <div style={eyeSize} className="bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-pulse delay-300"></div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-black relative overflow-hidden">
            {/* Scanlines Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
            {/* Glow */}
            <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent z-0"></div>
            
            <div className="relative z-20">
                {renderFace()}
            </div>
        </div>
    );
};

export const AIRobot: React.FC<AIRobotProps> = ({ onBack }) => {
    const [selectedRole, setSelectedRole] = useState<RobotRoleType | null>(null);
    const [activeTheme, setActiveTheme] = useState<string>('neutral');
    const [isTalking, setIsTalking] = useState(false);

    // Simulate random talking animation state
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) setIsTalking(true);
            else setIsTalking(false);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full bg-black text-white flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 flex items-center gap-4 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-20">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10">
                    <ChevronLeft className="text-white" />
                </button>
                <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-purple-400" />
                    <h1 className="text-xl font-bold">AI Robot Controller</h1>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24 no-scrollbar">
                
                {/* Robot Preview Section */}
                <div className="flex flex-col items-center">
                    <div className="relative w-64 h-64 bg-black rounded-[2rem] border-[8px] border-zinc-800 overflow-hidden shadow-2xl shadow-purple-900/20 ring-1 ring-white/10">
                         {/* Screen Bezel Reflection */}
                         <div className="absolute inset-0 z-30 rounded-[1.4rem] ring-1 ring-white/5 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent"></div>
                         
                         {/* TOP BAR STATUS */}
                         <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-30 opacity-60">
                            <Signal className="w-3 h-3 text-white" />
                            <span className="text-[10px] font-mono text-white">100%</span>
                            <Battery className="w-3 h-3 text-green-400" />
                         </div>

                         {/* Display Content */}
                         <div className="w-full h-full relative">
                             <RobotFace themeId={activeTheme} scale={1.2} />
                             
                             {/* Bottom Voice Waveform Overlay */}
                             <div className="absolute bottom-6 w-full px-12 flex justify-center items-center gap-1 h-4 z-20">
                                {[1,2,3,4,5].map(i => (
                                    <div 
                                        key={i} 
                                        className={`w-1 bg-white/50 rounded-full transition-all duration-100 ${isTalking ? 'h-full animate-pulse' : 'h-1'}`}
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                    ></div>
                                ))}
                             </div>
                         </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col items-center gap-1">
                        <h2 className="font-bold text-lg">Mercy Robot S1</h2>
                        <span className="text-green-500 text-xs flex items-center gap-1 bg-green-900/20 px-2 py-1 rounded-full border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> 
                            System Online
                        </span>
                    </div>
                </div>

                {/* Theme Selection */}
                <div>
                    <div className="flex justify-between items-center mb-4 ml-1">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Expression Gallery</h3>
                        <span className="text-[10px] bg-purple-900/30 text-purple-400 px-2 py-1 rounded border border-purple-500/20">Live Preview</span>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {THEMES.map(theme => (
                            <button 
                                key={theme.id}
                                onClick={() => setActiveTheme(theme.id)}
                                className={`
                                    relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 group bg-black
                                    ${activeTheme === theme.id 
                                        ? 'border-purple-500 scale-100 shadow-lg shadow-purple-900/40 ring-2 ring-purple-500/20' 
                                        : 'border-zinc-800 scale-95 opacity-80 hover:opacity-100 hover:border-zinc-700'}
                                `}
                            >
                                <div className="w-full h-full transform scale-50">
                                    <RobotFace themeId={theme.id} scale={0.8} />
                                </div>
                                
                                <span className="absolute bottom-2 left-0 w-full text-center text-[9px] font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider">{theme.name}</span>

                                {theme.isPremium && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-zinc-900/80 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                                        <Lock className="w-2.5 h-2.5 text-yellow-500" />
                                    </div>
                                )}
                                {activeTheme === theme.id && (
                                     <div className="absolute top-2 left-2 bg-purple-500 rounded-full p-0.5 shadow-sm">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                     </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Role Selection */}
                <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 ml-1">Active Behavior Role</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <RoleCard 
                            icon={Stethoscope} 
                            label="Doctor" 
                            active={selectedRole === 'DOCTOR'} 
                            onClick={() => setSelectedRole('DOCTOR')}
                            desc="Health Advice"
                            color="text-red-400"
                        />
                        <RoleCard 
                            icon={BookOpen} 
                            label="Tutor" 
                            active={selectedRole === 'TUTOR'} 
                            onClick={() => setSelectedRole('TUTOR')}
                            desc="English Teacher"
                            color="text-blue-400"
                        />
                         <RoleCard 
                            icon={Gamepad2} 
                            label="Gamer" 
                            active={selectedRole === 'ENTERTAINER'} 
                            onClick={() => setSelectedRole('ENTERTAINER')}
                            desc="Interactive Games"
                            color="text-yellow-400"
                        />
                         <RoleCard 
                            icon={Radio} 
                            label="DJ Mode" 
                            active={selectedRole === 'RADIO'} 
                            onClick={() => setSelectedRole('RADIO')}
                            desc="Music Stream"
                            color="text-purple-400"
                        />
                    </div>
                </div>
                
                {selectedRole && (
                     <div className="p-4 bg-zinc-900/80 rounded-xl border border-white/5 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                        <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center border border-green-500/20">
                            <Check className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Settings Updated</p>
                            <p className="text-xs text-zinc-500">Robot is now in <span className="text-white font-medium">{selectedRole}</span> mode.</p>
                        </div>
                     </div>
                )}

            </div>
        </div>
    );
};

const RoleCard = ({ icon: Icon, label, active, onClick, desc, color }: any) => (
    <button 
        onClick={onClick}
        className={`
            p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col h-full relative overflow-hidden group
            ${active 
                ? 'bg-white text-black border-white shadow-xl scale-[1.02]' 
                : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:border-white/10'}
        `}
    >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${active ? 'bg-black/10' : 'bg-black/40 group-hover:bg-black/60'}`}>
            <Icon className={`w-6 h-6 ${active ? 'text-black' : color}`} />
        </div>
        <div className="font-bold text-sm mb-1">{label}</div>
        <div className={`text-[10px] leading-tight ${active ? 'text-zinc-600' : 'text-zinc-500'}`}>{desc}</div>
        
        {active && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
    </button>
);
