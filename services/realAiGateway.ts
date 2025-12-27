
import { IAIGateway, VisionResult, ChatMessage } from '../types';
import { httpClient } from './httpClient';
import { quotaService } from './quotaService';

export class RealAIGateway implements IAIGateway {
  
  async analyzeImage(file: File): Promise<VisionResult> {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const result = await httpClient.upload<VisionResult>('/vision/analyze', formData);
        quotaService.increment('vision');
        return result;
    } catch (e) {
        // Fallback or rethrow depending on strategy. 
        // For now we rethrow so UI handles error state
        throw e;
    }
  }

  async sttOnce(audio: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audio);

    const response = await httpClient.upload<{ transcript: string }>('/stt/transcribe', formData);
    quotaService.increment('stt');
    return response.transcript;
  }

  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    const response = await httpClient.post<{ translatedText: string }>('/translate', {
        text,
        source: sourceLang,
        target: targetLang
    });
    
    quotaService.increment('translate');
    return response.translatedText;
  }

  async *chatStream(history: ChatMessage[], newMessage: string, image?: string): AsyncGenerator<string> {
    // Note: Fetch doesn't support easy streaming consumption of NDJSON in standard wrapper easily
    // We will simulate streaming from a full response for this demo, 
    // or assume the backend uses Server-Sent Events (SSE).
    // This implementation assumes a standard POST that returns the full text for compatibility,
    // but in a real Senior implementation, we'd use `fetch` with `body.getReader()`.

    try {
        // Request
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://api.mercy.ai/v1'}/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await this.getToken())}`
            },
            body: JSON.stringify({ history, message: newMessage, image })
        });

        if (response.status === 402 || response.status === 429) {
            quotaService.triggerPaywall();
            throw new Error("Quota Exceeded");
        }

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        quotaService.increment('chat');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            // Yield chunks (assuming backend sends plain text chunks)
            yield chunk;
        }

    } catch (e) {
        console.error("Chat Stream Error", e);
        throw e;
    }
  }

  // Helper just for the stream method since it bypasses HttpClient wrapper for streaming support
  private async getToken(): Promise<string> {
      const userStr = localStorage.getItem('mercy_auth_session');
      return userStr ? JSON.parse(userStr).uid : '';
  }
}
