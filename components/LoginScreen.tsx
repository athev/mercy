
import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { Button } from './ui/Button';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginScreen: React.FC = () => {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await signIn(email, password);
            // Permissions request simulates onboarding flow
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            } catch (err) {
                console.warn("Permissions skipped");
            }
        } catch (err: any) {
            setError(err.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-8 max-w-md mx-auto">
            <div className="w-full mb-12 text-center animate-in slide-in-from-top-4 duration-700">
                <h1 className="text-5xl font-bold tracking-tighter mb-2">MERCY</h1>
                <p className="text-zinc-500 uppercase tracking-widest text-sm">Visionary Intelligence</p>
            </div>
            
            <form onSubmit={handleSubmit} className="w-full space-y-4 animate-in fade-in duration-700 delay-150">
                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-sm text-red-200">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 group-focus-within:text-white transition-colors" />
                        <input 
                            type="email" 
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-all"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 group-focus-within:text-white transition-colors" />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-all"
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <Button type="submit" loading={loading} className="w-full rounded-xl py-4 font-bold mt-4" size="lg">
                    Sign In
                </Button>
            </form>

            <div className="mt-8 text-center space-y-4 animate-in fade-in duration-700 delay-300">
                <p className="text-sm text-zinc-500">
                    Don't have an account? <span className="text-white font-bold cursor-pointer hover:underline">Sign Up</span>
                </p>
                <p className="text-xs text-zinc-600">
                    By continuing, you grant access to Camera & Microphone for AI features.
                </p>
            </div>
        </div>
    );
};
