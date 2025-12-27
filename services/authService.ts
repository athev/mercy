
import { User } from '../types';

// Simulating Firebase User structure
export interface AuthUser {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
}

const STORAGE_KEY = 'mercy_auth_session';

class AuthService {
    // Simulates firebase.auth().onAuthStateChanged
    onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
        // Check local storage on init
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            callback(JSON.parse(stored));
        } else {
            callback(null);
        }

        // Return unsubscribe (mock)
        return () => {};
    }

    async signInWithEmailAndPassword(email: string, password: string): Promise<AuthUser> {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network

        if (!email.includes('@')) throw new Error("Invalid email address");
        if (password.length < 6) throw new Error("Password must be at least 6 characters");

        const user: AuthUser = {
            uid: 'usr_' + Date.now(),
            email: email,
            displayName: email.split('@')[0],
            photoURL: ''
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        // Force page reload or state update mechanism would happen via listener in real Firebase
        // For this mock, we rely on the caller to update state or reload, 
        // but to be robust we should really use an event emitter.
        // However, the Context will handle the "set" manually for this mock.
        return user;
    }

    async signOut(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        localStorage.removeItem(STORAGE_KEY);
    }
}

export const authService = new AuthService();
