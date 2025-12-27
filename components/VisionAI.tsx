
import React, { useState, useRef } from 'react';
import { ChevronLeft, Upload, ScanEye, Sparkles, Tag, FileText, ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { VisionResult } from '../types';
import { aiGateway } from '../services/aiGateway';
import { analytics } from '../services/analyticsService';
import { crashlytics } from '../services/crashlyticsService';

interface VisionAIProps {
    onBack: () => void;
}

type AnalysisState = 'idle' | 'loading' | 'success' | 'error';

// Custom Hook mimicking a "Controller" or "Provider" logic
const useVisionController = () => {
    const [state, setState] = useState<AnalysisState>('idle');
    const [result, setResult] = useState<VisionResult | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleSelectImage = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        setSelectedFile(file);
        // Reset state when new image is selected
        setState('idle');
        setResult(null);
    };

    const analyze = async () => {
        if (!selectedFile) return;

        setState('loading');
        try {
            const data = await aiGateway.analyzeImage(selectedFile);
            setResult(data);
            setState('success');
            analytics.logVisionAnalyze(true);
        } catch (e) {
            console.error(e);
            setState('error');
            analytics.logVisionAnalyze(false);
            crashlytics.recordError(e, undefined, 'VisionAI.analyze');
        }
    };

    return {
        state,
        result,
        imagePreview,
        handleSelectImage,
        analyze,
        reset: () => {
            setState('idle');
            setResult(null);
            setImagePreview(null);
            setSelectedFile(null);
        }
    };
};

export const VisionAI: React.FC<VisionAIProps> = ({ onBack }) => {
    const { state, result, imagePreview, handleSelectImage, analyze, reset } = useVisionController();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleSelectImage(e.target.files[0]);
        }
    };

    return (
        <div className="h-full bg-black text-white flex flex-col animate-in slide-in-from-right duration-300">
            <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={onFileChange} 
            />

            {/* Header */}
            <div className="p-4 flex items-center gap-4 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-20">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                    <ChevronLeft className="text-white" />
                </button>
                <div className="flex items-center gap-2">
                    <ScanEye className="w-5 h-5 text-cyan-400" />
                    <h1 className="text-xl font-bold">Vision AI</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-24">
                
                {/* Image Preview Area */}
                <div className="w-full aspect-[4/3] bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl flex flex-col items-center justify-center group">
                    {imagePreview ? (
                        <>
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            {/* Overlay Controls */}
                            {state !== 'loading' && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button onClick={() => fileInputRef.current?.click()} variant="secondary" size="sm" className="rounded-full shadow-xl">
                                        Change Image
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center space-y-4 p-6">
                            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-2 border border-white/5 shadow-inner">
                                <ImageIcon className="w-10 h-10 text-zinc-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Select an Image</h3>
                                <p className="text-sm text-zinc-500 max-w-[200px] mx-auto">Upload a photo to detect objects, extract text, and get AI insights.</p>
                            </div>
                            <Button onClick={() => fileInputRef.current?.click()} className="rounded-full px-8">
                                <Upload className="w-4 h-4 mr-2" /> Upload
                            </Button>
                        </div>
                    )}
                    
                    {/* Scanning Animation Overlay */}
                    {state === 'loading' && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                             <div className="w-full absolute top-0 h-1 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                             <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                             <p className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">ANALYZING SCENE...</p>
                        </div>
                    )}
                </div>

                {/* Analysis Trigger */}
                {state === 'idle' && imagePreview && (
                    <Button onClick={analyze} size="lg" className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-white/10">
                        <Sparkles className="w-5 h-5 mr-2" /> Analyze Image
                    </Button>
                )}

                {/* Error State */}
                {state === 'error' && (
                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-200 animate-in slide-in-from-bottom-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="font-bold">Analysis Failed</p>
                            <p className="text-xs opacity-80">Could not process image. Please try again.</p>
                        </div>
                        <Button onClick={analyze} size="sm" className="ml-auto bg-red-900/50 hover:bg-red-800 border-red-700">Retry</Button>
                    </div>
                )}

                {/* Results Dashboard */}
                {state === 'success' && result && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-6 duration-500">
                        {/* Description Card */}
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">AI Insight</h3>
                            </div>
                            <p className="text-lg leading-relaxed font-light text-zinc-100">
                                {result.description}
                            </p>
                            <div className="mt-4 flex justify-end">
                                <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-1 rounded-md border border-green-500/20">
                                    Confidence: {(result.confidence * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>

                        {/* Detected Objects */}
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
                             <div className="flex items-center gap-2 mb-4">
                                <Tag className="w-4 h-4 text-blue-400" />
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Objects Detected</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {result.detectedObjects.map((obj, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-300 font-medium">
                                        {obj}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* OCR Text */}
                        {result.ocrText && (
                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="w-4 h-4 text-orange-400" />
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Text Extracted</h3>
                                </div>
                                <div className="bg-black/40 p-4 rounded-xl font-mono text-sm text-zinc-300 border border-white/5 whitespace-pre-wrap">
                                    {result.ocrText}
                                </div>
                            </div>
                        )}

                        <Button onClick={reset} variant="outline" className="w-full rounded-2xl border-white/10 text-zinc-400 hover:text-white">
                            Analyze Another
                        </Button>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};
