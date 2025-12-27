
import React, { useState, useEffect } from 'react';
import { 
    Glasses, Battery, ChevronRight, Mic, Camera, Video, ScanEye, 
    Languages, Lightbulb, Hand, Mic2, Settings, Zap, 
    Plus, Bluetooth, BluetoothOff, User, Bell
} from 'lucide-react';
import { useDeviceService } from '../services/DeviceContext';
import { Button } from './ui/Button';

export const Home: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
    const deviceService = useDeviceService();
    const [connectionStatus, setConnectionStatus] = useState(deviceService.status);
    const [batteryLevel, setBatteryLevel] = useState(deviceService.battery);
    const [deviceInfo, setDeviceInfo] = useState(deviceService.deviceInfo);

    useEffect(() => {
        const unsubStatus = deviceService.subscribe('status', (s) => {
            setConnectionStatus(s);
            setDeviceInfo(deviceService.deviceInfo);
        });
        const unsubBattery = deviceService.subscribe('battery', setBatteryLevel);
        return () => {
            unsubStatus();
            unsubBattery();
        };
    }, [deviceService]);

    const isConnected = connectionStatus === 'CONNECTED';

    // Battery Circle Config - Precision Math
    const size = 100;
    const strokeWidth = 6;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (batteryLevel / 100) * circumference;

    if (!isConnected) {
        return (
            <div className="h-full bg-black text-white flex flex-col p-8 animate-in fade-in duration-1000">
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="relative mb-16">
                        <div className="absolute inset-0 bg-white/5 blur-[100px] rounded-full"></div>
                        <Glasses className="w-32 h-32 text-zinc-900 relative z-10" />
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-zinc-900 rounded-full border border-white/10 flex items-center justify-center">
                            <BluetoothOff size={24} className="text-zinc-600" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 tracking-tighter">MERCY</h1>
                    <p className="text-zinc-500 mb-12 max-w-xs text-sm font-medium leading-relaxed">Kết nối kính Mercy để bắt đầu hành trình AI của bạn.</p>
                    <Button onClick={() => onNavigate('devices')} className="w-full py-4 rounded-full bg-white text-black font-bold text-xs tracking-widest uppercase shadow-2xl active:scale-95 transition-all">Tìm thiết bị</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-black text-white flex flex-col overflow-y-auto no-scrollbar pb-32">
            
            {/* Header Area - Apple Minimalism */}
            <div className="px-6 pt-12 pb-8 flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tighter">MERCY</h1>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] opacity-60">AI Ecosystem</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => onNavigate('notifications')} className="relative">
                        <Bell size={24} className="text-zinc-400" />
                        <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-black"></div>
                    </button>
                    <button onClick={() => onNavigate('profile')} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden">
                        <User size={20} className="text-zinc-400" />
                    </button>
                </div>
            </div>

            {/* Status Card - Glassmorphism */}
            <div className="px-6 mb-10">
                <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/20 border border-white/10 rounded-[2.5rem] p-8 flex justify-between items-center backdrop-blur-3xl shadow-2xl">
                    <div className="space-y-4">
                        <div>
                            <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest block mb-2">Connected Device</span>
                            <h2 className="text-2xl font-bold leading-none">{deviceInfo?.name}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Active System</span>
                        </div>
                    </div>
                    
                    {/* Fixed Battery Circle UI */}
                    <div className="relative flex items-center justify-center">
                        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                            <circle 
                                cx={center} cy={center} r={radius} 
                                stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" 
                                className="text-zinc-800" 
                            />
                            <circle 
                                cx={center} cy={center} r={radius} 
                                stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" 
                                className="text-white transition-all duration-1000 ease-in-out"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                            <span className="text-2xl font-bold tracking-tighter leading-none">{batteryLevel}%</span>
                            <Battery size={10} className="text-zinc-500 mt-1" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid - 4 Columns */}
            <div className="px-6 mb-12">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-5 ml-1 opacity-50">Quick Actions</h3>
                <div className="grid grid-cols-4 gap-4">
                    <ActionButton icon={Languages} label="Translate" active onClick={() => onNavigate('translate')} />
                    <ActionButton icon={Camera} label="Camera" onClick={() => {}} />
                    <ActionButton icon={Video} label="Video" onClick={() => {}} />
                    <ActionButton icon={ScanEye} label="Vision" onClick={() => onNavigate('vision')} />
                </div>
            </div>

            {/* Ecosystem List */}
            <div className="px-6 mb-12">
                <div className="flex justify-between items-center mb-5 ml-1">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] opacity-50">Your Ecosystem</h3>
                    <Plus size={16} className="text-zinc-500" />
                </div>
                <div className="space-y-3">
                    <DeviceListItem 
                        icon={Glasses} 
                        name="Mercy Glasses Pro" 
                        status="CONNECTED" 
                        active
                    />
                    <DeviceListItem 
                        icon={Zap} 
                        name="Mercy Watch" 
                        status="CONNECTED" 
                    />
                    <DeviceListItem 
                        icon={Bluetooth} 
                        name="Mercy Buds X" 
                        status="DISCONNECTED" 
                    />
                </div>
            </div>

            {/* Settings List */}
            <div className="px-6">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 ml-1 opacity-50">Configuration</h3>
                <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] overflow-hidden divide-y divide-white/5">
                    <SettingsItem icon={Lightbulb} label="Tips & Manuals" onClick={() => onNavigate('tutorial_restart')} />
                    <SettingsItem icon={Hand} label="Touchpad Gestures" onClick={() => onNavigate('gestures')} />
                    <SettingsItem icon={Settings} label="Device Settings" onClick={() => onNavigate('devices')} />
                </div>
            </div>

        </div>
    );
};

const ActionButton = ({ icon: Icon, label, active, onClick }: any) => (
    <button onClick={onClick} className="flex flex-col items-center gap-3 group">
        <div className={`w-full aspect-square rounded-[1.8rem] flex items-center justify-center transition-all duration-300 active:scale-90
            ${active ? 'bg-white text-black shadow-xl shadow-white/5' : 'bg-zinc-900 border border-white/5 text-zinc-500 group-hover:text-white'}
        `}>
            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        </div>
        <span className={`text-[9px] font-bold tracking-tight uppercase transition-colors ${active ? 'text-white' : 'text-zinc-600'}`}>{label}</span>
    </button>
);

const DeviceListItem = ({ icon: Icon, name, status, active }: any) => {
    const isConnected = status === 'CONNECTED';
    return (
        <div className={`w-full flex items-center justify-between p-4 bg-zinc-900/40 border border-white/5 rounded-3xl transition-all ${!isConnected && 'opacity-40 grayscale'}`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                    <Icon size={22} />
                </div>
                <div className="text-left">
                    <p className="text-xs font-bold">{name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-zinc-600'}`}></div>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{status}</span>
                    </div>
                </div>
            </div>
            <ChevronRight size={14} className="text-zinc-800" />
        </div>
    );
};

const SettingsItem = ({ icon: Icon, label, onClick }: any) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors group">
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center text-zinc-600 group-hover:text-white">
                <Icon size={16} />
            </div>
            <span className="text-xs font-bold text-zinc-400 group-hover:text-white">{label}</span>
        </div>
        <ChevronRight size={14} className="text-zinc-800" />
    </button>
);
