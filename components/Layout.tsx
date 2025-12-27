
import React, { useEffect, useState } from 'react';
import { Home, Languages, LayoutGrid, Sparkles, Image as ImageIcon, User } from 'lucide-react';
import { useDeviceService } from '../services/DeviceContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const deviceService = useDeviceService();
  const [isConnected, setIsConnected] = useState(deviceService.status === 'CONNECTED');

  useEffect(() => {
    const unsub = deviceService.subscribe('status', (status) => {
      setIsConnected(status === 'CONNECTED');
    });
    return () => unsub();
  }, [deviceService]);

  // Danh sách Tab khi CHƯA kết nối
  const guestTabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'mercy_hub', icon: LayoutGrid, label: 'Store' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  // Danh sách Tab khi ĐÃ kết nối
  const connectedTabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'translate', icon: Languages, label: 'Translate' },
    { id: 'mercy_hub', icon: LayoutGrid, label: 'AI Hub' },
    { id: 'assistant', icon: Sparkles, label: 'Assistant' },
    { id: 'gallery', icon: ImageIcon, label: 'Gallery' },
  ];

  const currentTabs = isConnected ? connectedTabs : guestTabs;

  return (
    <div className="h-[100dvh] w-full bg-black flex flex-col overflow-hidden max-w-md mx-auto border-x border-zinc-900 shadow-2xl relative">
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>

      <nav className="h-24 bg-black/95 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-4 pb-safe-bottom z-50 shrink-0">
        {currentTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex flex-col items-center justify-center flex-1 h-14 gap-2 transition-all relative ${isActive ? 'text-white' : 'text-zinc-600'}`}
                >
                    <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-zinc-900 shadow-lg shadow-white/5 scale-110' : 'hover:text-zinc-400'}`}>
                        <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`text-[9px] font-bold tracking-tight uppercase transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-0.5'}`}>
                        {tab.label}
                    </span>
                    {isActive && (
                        <div className="absolute top-0 w-8 h-1 bg-white rounded-full blur-[2px] opacity-20" />
                    )}
                </button>
            );
        })}
      </nav>
    </div>
  );
};
