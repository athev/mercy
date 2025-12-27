
import { ChatMessage } from '../types';

const STORAGE_KEY = 'mercy_chat_history_v1';

export class ChatRepository {
    
    saveMessages(messages: ChatMessage[]): void {
        try {
            // In a real app, we might limit this to the last 50 messages to save space
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch (e) {
            console.error("Failed to save chat history", e);
        }
    }

    getMessages(): ChatMessage[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];
            return JSON.parse(data);
        } catch (e) {
            console.error("Failed to load chat history", e);
            return [];
        }
    }

    clearHistory(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
}

export const chatRepository = new ChatRepository();
