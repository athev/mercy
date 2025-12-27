
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
import { DeviceProvider, useDeviceService } from './services/DeviceContext';
import { AuthProvider, useAuth } from './services/AuthContext';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    const deviceService = useDeviceService();
    const [activeTab, setActiveTab] = useState('home');
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Monitor device connection for first-time tutorial
    useEffect(() => {
        const unsub = deviceService.subscribe('status', (status) => {
            const hasOnboarded = localStorage.getItem('mercy_tutorial_status');
            if (status === 'CONNECTED' && !hasOnboarded) {
                setShowOnboarding(true);
            }
        });
        return () => unsub();
    }, [deviceService]);

    const handleOnboardingComplete = (status: 'completed' | 'skipped' | 'hub') => {
        localStorage.setItem('mercy_tutorial_status', status === 'hub' || status === 'completed' ? 'completed' : 'skipped');
        setShowOnboarding(false);
        if (status === 'hub') {
            setActiveTab('mercy_hub');
        }
        // Dispatch event for other components to know tutorial state changed
        window.dispatchEvent(new Event('storage'));
    };

    if (loading) {
        return (
            <div className="h-screen w-full bg-black flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Initializing Mercy OS...</p>
            </div>
        );
    }

    if (!user) {
        return <LoginScreen />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return <Home onNavigate={setActiveTab} />;
            case 'mercy_hub': return <Marketplace />;
            case 'profile': return <ProfileScreen />;
            
            // Sub-screens triggered via Home/Profile actions
            case 'devices': return <Devices onBack={() => setActiveTab('home')} />;
            case 'translate': return <Translator />;
            case 'firmware': return <FirmwareUpdateScreen onBack={() => setActiveTab('home')} />;
            case 'gestures': return <GestureSettings onBack={() => setActiveTab('home')} />;
            case 'tutorial_restart': return <GuidedOnboarding onComplete={handleOnboardingComplete} />;
            case 'tutorial': return <TutorialScreen onComplete={() => setActiveTab('home')} />;
            
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
