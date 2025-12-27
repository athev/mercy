
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Translator } from './components/Translator';
import { Devices } from './components/Devices';
import { Marketplace } from './components/Marketplace';
import { Assistant } from './components/Assistant';
import { MediaLibrary } from './components/MediaLibrary';
import { Home } from './components/Home';
import { AIRobot } from './components/AIRobot';
import { VisionAI } from './components/VisionAI';
import { GestureSettings } from './components/GestureSettings';
import { TutorialScreen } from './components/TutorialScreen';
import { FirmwareUpdateScreen } from './components/FirmwareUpdateScreen';
import { LoginScreen } from './components/LoginScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { PaywallModal } from './components/PaywallModal';
import { GuidedOnboarding } from './components/GuidedOnboarding';
import { AIHub } from './components/AIHub';
import { DeviceProvider, useDeviceService } from './services/DeviceContext';
import { AuthProvider, useAuth } from './services/AuthContext';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    const deviceService = useDeviceService();
    const [activeTab, setActiveTab] = useState('home');
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Monitor device connection
    useEffect(() => {
        const unsub = deviceService.subscribe('status', (status) => {
            const isConnected = status === 'CONNECTED';
            
            // Check if user is in a forbidden tab for guest mode
            const aiTabs = ['translate', 'assistant', 'gallery', 'vision', 'robot'];
            if (!isConnected && aiTabs.includes(activeTab)) {
                setActiveTab('home');
            }

            // Show onboarding for first time connection
            const hasOnboarded = localStorage.getItem('mercy_tutorial_status');
            if (isConnected && !hasOnboarded) {
                setShowOnboarding(true);
            }
        });
        return () => unsub();
    }, [deviceService, activeTab]);

    const handleOnboardingComplete = (status: 'completed' | 'skipped' | 'hub') => {
        localStorage.setItem('mercy_tutorial_status', status === 'hub' || status === 'completed' ? 'completed' : 'skipped');
        setShowOnboarding(false);
        if (status === 'hub') {
            setActiveTab('mercy_hub');
        }
        window.dispatchEvent(new Event('storage'));
    };

    if (loading) {
        return (
            <div className="h-screen w-full bg-black flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black">Initializing Mercy OS...</p>
            </div>
        );
    }

    if (!user) {
        return <LoginScreen />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return <Home onNavigate={setActiveTab} />;
            case 'translate': return <Translator />;
            case 'mercy_hub': return <AIHub onNavigate={(tab) => setActiveTab(tab)} />;
            case 'assistant': return <Assistant />;
            case 'gallery': return <MediaLibrary />;
            case 'profile': return <ProfileScreen />;
            
            // Sub-screens
            case 'devices': return <Devices onBack={() => setActiveTab('home')} />;
            case 'vision': return <VisionAI onBack={() => setActiveTab('mercy_hub')} />;
            case 'robot': return <AIRobot onBack={() => setActiveTab('mercy_hub')} />;
            case 'firmware': return <FirmwareUpdateScreen onBack={() => setActiveTab('home')} />;
            case 'gestures': return <GestureSettings onBack={() => setActiveTab('home')} />;
            case 'tutorial_restart': return <GuidedOnboarding onComplete={handleOnboardingComplete} />;
            
            // Fallback
            default: return <Home onNavigate={setActiveTab} />;
        }
    };

    return (
        <>
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
                {renderContent()}
            </Layout>
            {showOnboarding && <GuidedOnboarding onComplete={handleOnboardingComplete} />}
            <PaywallModal />
        </>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
        <DeviceProvider>
            <AppContent />
        </DeviceProvider>
    </AuthProvider>
  );
};

export default App;
