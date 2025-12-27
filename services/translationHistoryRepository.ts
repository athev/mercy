
import { TranslationSession } from '../types';

const STORAGE_KEY = 'mercy_translation_sessions_v1';

export class TranslationHistoryRepository {
    
    saveSession(session: TranslationSession): void {
        try {
            const sessions = this.getSessions();
            // Prepend to list (newest first)
            sessions.unshift(session);
            
            // Limit to last 50 sessions
            if (sessions.length > 50) {
                sessions.pop();
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
            console.log("Session saved:", session.id);
        } catch (e) {
            console.error("Failed to save translation session", e);
        }
    }

    getSessions(): TranslationSession[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to load translation history", e);
            return [];
        }
    }

    getSessionById(id: string): TranslationSession | undefined {
        const sessions = this.getSessions();
        return sessions.find(s => s.id === id);
    }

    deleteSession(id: string): void {
        try {
            const sessions = this.getSessions();
            const filtered = sessions.filter(s => s.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch (e) {
            console.error("Failed to delete session", e);
        }
    }
    
    clearAll(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
}

export const translationHistoryRepository = new TranslationHistoryRepository();
