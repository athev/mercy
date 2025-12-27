
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthUser } from './authService';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signIn: (e: string, p: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to auth state changes (Persistence)
        const unsubscribe = authService.onAuthStateChanged((u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, pass: string) => {
        const u = await authService.signInWithEmailAndPassword(email, pass);
        setUser(u); // Manually update state for the mock service
    };

    const signOut = async () => {
        await authService.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
