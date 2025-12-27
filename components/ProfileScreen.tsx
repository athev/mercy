
import React from 'react';
import { useAuth } from '../services/AuthContext';
import { Button } from './ui/Button';
import { User, LogOut, Shield, CreditCard, Bell, ChevronRight, Settings } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
    const { user, signOut } = useAuth();

    return (
        <div className="h-full bg-black text-white flex flex-col animate-in slide-in-from-right duration-300">
             {/* Header */}
             <div className="p-6 pt-10 pb-6 bg-gradient-to-b from-zinc-900 to-black border-b border-white/5">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-white/10 flex items-center justify-center relative">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User size={32} className="text-zinc-500" />
                        )}
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-black"></div>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">{user?.displayName || 'Mercy User'}</h1>
                        <p className="text-sm text-zinc-500 font-mono">{user?.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-500/20">
                            Free Plan
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2 mb-2">Account</h3>
                    <ProfileMenuItem icon={Shield} label="Security & Privacy" />
                    <ProfileMenuItem icon={CreditCard} label="Subscription" badge="Upgrade" />
                    <ProfileMenuItem icon={Bell} label="Notifications" />
                </div>

                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2 mb-2">App Settings</h3>
                    <ProfileMenuItem icon={Settings} label="General" />
                </div>

                <Button variant="danger" onClick={signOut} className="w-full mt-8 rounded-xl py-4">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
                
                <p className="text-center text-xs text-zinc-700 mt-4 font-mono">
                    Version 1.2.0 (Build 402)
                </p>
            </div>
        </div>
    );
};

const ProfileMenuItem = ({ icon: Icon, label, badge }: any) => (
    <button className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-white/5 rounded-2xl group hover:bg-zinc-800 transition-colors active:scale-[0.99]">
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-zinc-400 group-hover:text-white">
                <Icon size={16} />
            </div>
            <span className="font-medium text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {badge && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded-full">
                    {badge}
                </span>
            )}
            <ChevronRight size={16} className="text-zinc-600" />
        </div>
    </button>
);
