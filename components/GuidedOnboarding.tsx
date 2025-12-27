
import React, { useState } from 'react';
import { 
    Glasses, Touchpad, ShieldCheck, Sparkles, CheckCircle2, ChevronRight, 
    Mic, Camera, Battery, Cpu, Bluetooth, HardDrive, Info, ArrowLeft, 
    Volume2, FileText, Store, Video, ScanEye, Languages
} from 'lucide-react';
import { Button } from './ui/Button';
import { useDeviceService } from '../services/DeviceContext';

interface GuidedOnboardingProps {
    onComplete: (status: 'completed' | 'skipped' | 'hub') => void;
}

export const GuidedOnboarding: React.FC<GuidedOnboardingProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [permissions, setPermissions] = useState({ camera: false, mic: false, bt: false, storage: false });
    const deviceService = useDeviceService();
    const battery = deviceService.battery;

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete('completed');
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const togglePermission = (key: keyof typeof permissions) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col animate-in fade-in duration-500 overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 transition-all duration-1000 
                ${currentStep === 0 ? 'bg-blue-500' : currentStep === 1 ? 'bg-purple-500' : currentStep === 2 ? 'bg-red-500' : currentStep === 3 ? 'bg-amber-500' : 'bg-cyan-500'}`} 
            />

            {/* Progress Bar */}
            <div className="pt-12 px-8 flex gap-1.5 z-10">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'bg-zinc-800'}`} />
                ))}
            </div>

            <div className="relative flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto no-scrollbar">
                
                {/* Bước 1: Làm quen */}
                {currentStep === 0 && (
                    <div className="w-full max-w-xs flex flex-col items-center text-center animate-in slide-in-from-bottom-4">
                        <div className="mb-8 p-8 bg-zinc-900/50 rounded-[3rem] border border-white/10 shadow-2xl">
                            <Glasses size={70} className="text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Làm quen với Mercy Glass</h2>
                        <p className="text-zinc-500 text-sm mb-8 leading-relaxed">Khám phá các thành phần chính trên kính của bạn.</p>
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <StepInfo icon={Camera} label="Camera AI" />
                            <StepInfo icon={Mic} label="Micro kép" />
                            <StepInfo icon={Volume2} label="Loa truyền xương" />
                            <StepInfo icon={Touchpad} label="Thanh cảm ứng" />
                        </div>
                    </div>
                )}

                {/* Bước 2: Cách điều khiển */}
                {currentStep === 1 && (
                    <div className="w-full max-w-xs flex flex-col items-center text-center animate-in slide-in-from-bottom-4">
                        <div className="mb-8 p-8 bg-zinc-900/50 rounded-[3rem] border border-white/10 shadow-2xl">
                            <Touchpad size={70} className="text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Cách điều khiển kính</h2>
                        <p className="text-zinc-500 text-sm mb-6">Thao tác nhanh trên gọng kính bên phải.</p>
                        <div className="space-y-3 w-full">
                            <ControlItem label="Nhấn giữ" desc="Bật / Tắt kính" />
                            <ControlItem label="Chạm 1 lần" desc="Chụp ảnh AI" />
                            <ControlItem label="Chạm 2 lần" desc="Quay video nhanh" />
                        </div>
                    </div>
                )}

                {/* Bước 3: Quyền riêng tư */}
                {currentStep === 2 && (
                    <div className="w-full max-w-xs flex flex-col items-center text-center animate-in slide-in-from-bottom-4">
                        <div className="mb-8 p-8 bg-zinc-900/50 rounded-[3rem] border border-white/10 shadow-2xl">
                            <ShieldCheck size={70} className="text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Quyền riêng tư & Kết nối</h2>
                        <p className="text-zinc-500 text-sm mb-8 leading-relaxed">Đèn LED đỏ sẽ báo hiệu khi ghi hình. Vui lòng cấp các quyền sau:</p>
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <PermissionBtn active={permissions.camera} icon={Camera} label="Camera" onClick={() => togglePermission('camera')} />
                            <PermissionBtn active={permissions.mic} icon={Mic} label="Micro" onClick={() => togglePermission('mic')} />
                            <PermissionBtn active={permissions.bt} icon={Bluetooth} label="Bluetooth" onClick={() => togglePermission('bt')} />
                            <PermissionBtn active={permissions.storage} icon={HardDrive} label="Bộ nhớ" onClick={() => togglePermission('storage')} />
                        </div>
                    </div>
                )}

                {/* Bước 4: AI Thông minh */}
                {currentStep === 3 && (
                    <div className="w-full max-w-xs flex flex-col items-center text-center animate-in slide-in-from-bottom-4">
                        <div className="mb-8 p-8 bg-zinc-900/50 rounded-[3rem] border border-white/10 shadow-2xl">
                            <Sparkles size={70} className="text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">AI & Tính năng thông minh</h2>
                        <p className="text-zinc-500 text-sm mb-8 leading-relaxed">Dịch thuật trực tiếp, trợ lý ảo và ghi chú thông minh luôn sẵn sàng.</p>
                        <div className="space-y-3 w-full text-left">
                            <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl flex gap-3 items-center">
                                <Languages size={18} className="text-blue-400" />
                                <span className="text-xs font-bold text-zinc-200">Dịch thuật & Ghi chú nhanh</span>
                            </div>
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-1">Mercy Hub</p>
                                <p className="text-xs text-zinc-300">Khám phá thêm các gói AI tại Mercy Hub.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bước 5: Hoàn tất */}
                {currentStep === 4 && (
                    <div className="w-full max-w-xs flex flex-col items-center text-center animate-in zoom-in-95">
                        <div className="mb-10 relative">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full animate-pulse"></div>
                            <div className="relative w-36 h-36 bg-zinc-900 rounded-full border-4 border-cyan-500 flex items-center justify-center shadow-2xl">
                                <CheckCircle2 size={60} className="text-cyan-400" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-8">Sẵn sàng sử dụng 🎉</h2>
                        <div className="grid grid-cols-2 gap-4 w-full mb-10">
                            <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-2xl">
                                <Battery size={16} className="text-zinc-500 mb-1" />
                                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Pin</span>
                                <span className="text-lg font-bold text-white">{battery}%</span>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-2xl">
                                <Cpu size={16} className="text-zinc-500 mb-1" />
                                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Firmware</span>
                                <span className="text-lg font-bold text-white">v1.2.0</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-8 pb-12 flex flex-col gap-4">
                {currentStep === 4 ? (
                    <>
                        <Button onClick={handleNext} className="w-full py-5 rounded-[2rem] bg-white text-black font-bold text-lg">
                            Bắt đầu sử dụng Mercy Glass
                        </Button>
                        <div className="flex gap-3">
                            <button onClick={() => setCurrentStep(0)} className="flex-1 py-4 bg-zinc-900 rounded-2xl text-xs font-bold text-zinc-400 border border-white/5">Xem lại hướng dẫn</button>
                            <button onClick={() => onComplete('hub')} className="flex-1 py-4 bg-zinc-900 rounded-2xl text-xs font-bold text-zinc-400 border border-white/5">Mở Mercy Hub</button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        {currentStep > 0 && (
                            <button onClick={handleBack} className="w-14 h-14 bg-zinc-900 rounded-2xl border border-white/10 flex items-center justify-center text-zinc-400"><ArrowLeft size={24} /></button>
                        )}
                        <Button onClick={handleNext} className={`flex-1 py-5 rounded-2xl font-bold text-lg ${currentStep === 2 && Object.values(permissions).some(v => !v) ? 'opacity-40 pointer-events-none' : 'bg-white text-black'}`}>
                            Tiếp theo
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const StepInfo = ({ icon: Icon, label }: any) => (
    <div className="flex flex-col items-center gap-2 p-3 bg-zinc-900 border border-white/5 rounded-2xl">
        <Icon size={20} className="text-zinc-400" />
        <span className="text-[10px] font-bold text-zinc-300">{label}</span>
    </div>
);

const ControlItem = ({ label, desc }: any) => (
    <div className="flex justify-between items-center p-4 bg-zinc-900 rounded-2xl border border-white/5">
        <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">{label}</span>
        <span className="text-xs text-white">{desc}</span>
    </div>
);

const PermissionBtn = ({ active, icon: Icon, label, onClick }: any) => (
    <button onClick={onClick} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${active ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-white/5'}`}>
        <Icon size={16} /><span className="text-xs font-bold">{label}</span>
    </button>
);
