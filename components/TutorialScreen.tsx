
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, Camera, Video, Maximize, CheckCircle2, Touchpad, GalleryVerticalEnd } from 'lucide-react';
import { Button } from './ui/Button';

interface TutorialScreenProps {
    onComplete: () => void;
}

const TUTORIAL_STEPS = [
    {
        title: "Welcome to Mercy Cam",
        description: "Your smart glasses are equipped with a high-fidelity AI camera. Let's learn the basics of capturing the world around you.",
        icon: Camera,
        color: "text-blue-400"
    },
    {
        title: "Taking a Photo",
        description: "To capture a standard 12MP photo, simply tap the touchpad once. You'll hear a shutter sound and see a flash in your HUD.",
        icon: Touchpad,
        color: "text-purple-400"
    },
    {
        title: "Recording Video",
        description: "Long-press the touchpad for 1 second to start recording. The LED will turn solid red. Tap again to stop recording.",
        icon: Video,
        color: "text-red-400"
    },
    {
        title: "Zoom & Modes",
        description: "Swipe forward on the touchpad to Zoom In. Swipe backward to Zoom Out. Double tap to switch between Wide and Telephoto lenses.",
        icon: Maximize,
        color: "text-green-400"
    },
    {
        title: "Accessing Gallery",
        description: "Your media syncs automatically. To view recent captures quickly, swipe down on the touchpad while in standby mode.",
        icon: GalleryVerticalEnd,
        color: "text-yellow-400"
    },
    {
        title: "You're Ready!",
        description: "You have mastered the basics. Remember, you can also use voice commands like 'Hey Mercy, take a picture'.",
        icon: CheckCircle2,
        color: "text-cyan-400"
    }
];

const STORAGE_KEY_TUTORIAL = 'mercy_tutorial_completed';

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = TUTORIAL_STEPS.length;

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishTutorial();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const finishTutorial = () => {
        localStorage.setItem(STORAGE_KEY_TUTORIAL, 'true');
        onComplete();
    };

    return (
        <div className="h-full bg-black text-white flex flex-col relative overflow-hidden animate-in fade-in duration-300">
            
            {/* Top Bar */}
            <div className="p-6 flex justify-between items-center z-20">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Step {currentStep + 1}/{totalSteps}
                </div>
                <button 
                    onClick={finishTutorial}
                    className="text-xs font-medium text-zinc-400 hover:text-white px-3 py-1 rounded-full hover:bg-white/10 transition-colors"
                >
                    Skip
                </button>
            </div>

            {/* Carousel Container */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Background Glow */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-colors duration-500 ${TUTORIAL_STEPS[currentStep].color.replace('text', 'bg')}`}></div>

                {/* Slides Track */}
                <div 
                    className="flex w-full h-full transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentStep * 100}%)` }}
                >
                    {TUTORIAL_STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        
                        return (
                            <div 
                                key={index} 
                                className="w-full h-full flex-shrink-0 flex flex-col items-center justify-center p-8 text-center transition-opacity duration-500"
                                style={{ opacity: isActive ? 1 : 0.3, transform: isActive ? 'scale(1)' : 'scale(0.95)' }}
                            >
                                {/* Illustration Placeholder */}
                                <div className="mb-8 relative group">
                                    <div className="w-40 h-40 rounded-[2rem] bg-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl relative z-10">
                                        <Icon size={64} className={`${step.color} transition-transform duration-500 ${isActive ? 'scale-110' : 'scale-100'}`} />
                                    </div>
                                    {/* Decorative Element */}
                                    <div className={`absolute -inset-2 rounded-[2.5rem] border border-white/5 z-0 ${isActive ? 'animate-pulse-fast' : ''}`}></div>
                                </div>

                                <h2 className="text-3xl font-bold mb-4">{step.title}</h2>
                                <p className="text-zinc-400 leading-relaxed max-w-xs mx-auto">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-6 pb-10 z-20 bg-gradient-to-t from-black via-black/90 to-transparent">
                
                {/* Indicators */}
                <div className="flex justify-center gap-2 mb-8">
                    {TUTORIAL_STEPS.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-white' : 'w-1.5 bg-zinc-800'}`}
                        />
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                    {currentStep > 0 ? (
                        <Button 
                            variant="secondary" 
                            onClick={handleBack}
                            className="flex-1 rounded-2xl"
                        >
                            Back
                        </Button>
                    ) : (
                         <div className="flex-1"></div> // Spacer to keep Next button right-aligned or full width if preferred
                    )}

                    <Button 
                        onClick={handleNext} 
                        className={`flex-[2] rounded-2xl font-bold ${currentStep === totalSteps - 1 ? 'bg-white text-black hover:bg-zinc-200' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                    >
                        {currentStep === totalSteps - 1 ? (
                            <span className="flex items-center gap-2">Done <CheckCircle2 size={18} /></span>
                        ) : (
                            <span className="flex items-center gap-2">Next <ChevronRight size={18} /></span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
