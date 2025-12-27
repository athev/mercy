
import React, { useState, useEffect } from 'react';
import { ChevronLeft, RefreshCw, Cpu, CheckCircle2, Download, AlertCircle, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { useDeviceService } from '../services/DeviceContext';
import { FirmwareProgress, FirmwareStage } from '../types';

interface FirmwareUpdateScreenProps {
    onBack: () => void;
}

const RELEASE_NOTES = [
    "Improved battery life in standby mode (approx. +15%).",
    "Enhanced low-light camera performance.",
    "Fixed audio latency issues in simultaneous translation.",
    "New 'Robot Controller' API support.",
    "Security patches for BLE pairing."
];

export const FirmwareUpdateScreen: React.FC<FirmwareUpdateScreenProps> = ({ onBack }) => {
    const deviceService = useDeviceService();
    const [progressState, setProgressState] = useState<FirmwareProgress>({ stage: 'IDLE', progress: 0 });
    const [currentVersion, setCurrentVersion] = useState('Checking...');
    const [availableVersion, setAvailableVersion] = useState('1.2.0-STABLE');

    // Sync initial device info
    useEffect(() => {
        if (deviceService.deviceInfo) {
            setCurrentVersion(deviceService.deviceInfo.firmwareVersion);
        }
        
        // Subscribe to progress events
        const unsub = deviceService.subscribe('firmware_progress', (state: FirmwareProgress) => {
            setProgressState(state);
        });

        // Update version when complete
        const unsubStatus = deviceService.subscribe('status', () => {
             if (deviceService.deviceInfo) {
                setCurrentVersion(deviceService.deviceInfo.firmwareVersion);
            }
        });

        return () => {
            unsub();
            unsubStatus();
        };
    }, [deviceService]);

    const handleUpdate = async () => {
        try {
            // In a real scenario, we might let the user pick a file, 
            // but for OTA we usually just fetch the latest.
            await deviceService.updateFirmware(); 
        } catch (e) {
            console.error(e);
            setProgressState({ stage: 'FAILED', progress: 0, message: 'Update failed to initialize.' });
        }
    };

    const isUpdating = ['DOWNLOADING', 'FLASHING', 'VERIFYING'].includes(progressState.stage);
    const isComplete = progressState.stage === 'COMPLETE';
    const isUpToDate = currentVersion === availableVersion && !isComplete;

    // Helper to determine step status: 'waiting' | 'active' | 'completed'
    const getStepStatus = (stepStage: FirmwareStage) => {
        const order = ['IDLE', 'DOWNLOADING', 'FLASHING', 'VERIFYING', 'COMPLETE'];
        const currentIdx = order.indexOf(progressState.stage);
        const stepIdx = order.indexOf(stepStage);
        
        if (progressState.stage === 'FAILED') return 'waiting';
        if (currentIdx > stepIdx) return 'completed';
        if (currentIdx === stepIdx) return 'active';
        return 'waiting';
    };

    return (
        <div className="h-full bg-black text-white flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 flex items-center gap-4 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-20">
                {!isUpdating && (
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10">
                        <ChevronLeft className="text-white" />
                    </button>
                )}
                <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-purple-400" />
                    <h1 className="text-xl font-bold">System Update</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24 no-scrollbar">
                
                {/* Visualizer / Icon */}
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-500
                            ${isUpdating ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-pulse' : 
                              isComplete ? 'border-green-500 bg-green-900/20' : 'border-zinc-800 bg-zinc-900'}
                        `}>
                            {isComplete ? (
                                <CheckCircle2 size={48} className="text-green-500" />
                            ) : (
                                <RefreshCw size={48} className={`text-zinc-400 ${isUpdating ? 'animate-spin' : ''}`} />
                            )}
                        </div>
                        {isUpdating && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold font-mono mt-10">
                                {progressState.progress}%
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 text-center">
                        <h2 className="text-lg font-bold">
                            {progressState.stage === 'IDLE' ? 'Ready to Update' :
                             progressState.stage === 'COMPLETE' ? 'Update Successful' :
                             progressState.stage === 'FAILED' ? 'Update Failed' :
                             'Updating Device...'}
                        </h2>
                        <p className="text-zinc-500 text-sm mt-1">
                            {progressState.message || 'Mercy Glass Pro'}
                        </p>
                    </div>
                </div>

                {/* Status Cards */}
                {!isUpdating && !isComplete && (
                     <div className="bg-zinc-900 rounded-2xl p-5 border border-white/10 flex items-center justify-between">
                         <div>
                             <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Current Version</p>
                             <p className="font-mono text-lg text-zinc-300">{currentVersion}</p>
                         </div>
                         <ArrowRight className="text-zinc-600" />
                         <div className="text-right">
                             <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Available</p>
                             <p className="font-mono text-lg text-green-400 font-bold">{availableVersion}</p>
                         </div>
                     </div>
                )}

                {/* Progress Stages UI */}
                {isUpdating && (
                    <div className="space-y-4">
                        <StepItem 
                            icon={Download} 
                            label="Downloading Package" 
                            status={getStepStatus('DOWNLOADING')} 
                        />
                        <StepItem 
                            icon={Zap} 
                            label="Flashing Firmware" 
                            status={getStepStatus('FLASHING')} 
                        />
                         <StepItem 
                            icon={ShieldCheck} 
                            label="Verifying Integrity" 
                            status={getStepStatus('VERIFYING')} 
                        />
                    </div>
                )}

                {/* Release Notes */}
                {!isUpdating && !isComplete && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider pl-2">What's New</h3>
                        <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/5 space-y-3">
                            {RELEASE_NOTES.map((note, i) => (
                                <div key={i} className="flex gap-3 text-sm text-zinc-300">
                                    <span className="text-purple-500 font-bold">•</span>
                                    {note}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="pt-4">
                    {progressState.stage === 'FAILED' ? (
                         <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-2xl flex flex-col gap-3 text-center">
                            <div className="flex items-center justify-center gap-2 text-red-200 font-bold">
                                <AlertCircle size={20} /> Error
                            </div>
                            <p className="text-xs text-red-300">
                                Connection interrupted. Please ensure device has >50% battery and is close to phone.
                            </p>
                            <Button onClick={() => setProgressState({ stage: 'IDLE', progress: 0 })} variant="secondary">
                                Try Again
                            </Button>
                        </div>
                    ) : isComplete ? (
                        <Button onClick={onBack} className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl">
                            Back to Home
                        </Button>
                    ) : !isUpdating ? (
                        <Button 
                            onClick={handleUpdate} 
                            disabled={isUpToDate}
                            className={`w-full py-4 rounded-xl font-bold ${isUpToDate ? 'opacity-50 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'}`}
                        >
                            {isUpToDate ? 'Device Up to Date' : 'Download & Install'}
                        </Button>
                    ) : (
                        <div className="text-center">
                            <p className="text-xs text-zinc-500 animate-pulse">
                                Please do not close the app or turn off your glasses.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

const StepItem = ({ icon: Icon, label, status }: { icon: any, label: string, status: 'waiting' | 'active' | 'completed' }) => {
    return (
        <div className={`flex items-center gap-4 p-3 rounded-xl transition-all ${status === 'active' ? 'bg-zinc-800 border border-white/10' : 'opacity-50'}`}>
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${status === 'completed' ? 'bg-green-500 text-white' : 
                  status === 'active' ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-600'}
            `}>
                {status === 'completed' ? <CheckCircle2 size={20} /> : <Icon size={20} />}
            </div>
            <div className="flex-1">
                <p className={`text-sm font-bold ${status === 'active' ? 'text-white' : 'text-zinc-400'}`}>
                    {label}
                </p>
                {status === 'active' && (
                    <div className="w-full h-1 bg-zinc-700 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-purple-500 animate-[loading_1s_infinite]"></div>
                    </div>
                )}
            </div>
        </div>
    );
};
