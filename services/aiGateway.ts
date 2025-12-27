
import { IAIGateway, VisionResult, ChatMessage } from '../types';

export class MockAIGateway implements IAIGateway {
  
  // --- Vision ---
  async analyzeImage(file: File): Promise<VisionResult> {
    // Simulate network latency (1.5 - 3 seconds)
    const delay = Math.random() * 1500 + 1500;
    await new Promise(resolve => setTimeout(resolve, delay));

    const isDocument = Math.random() > 0.5;

    if (isDocument) {
        return {
            description: "A close-up photograph of a business document with financial charts.",
            detectedObjects: ["Paper", "Text", "Chart", "Table"],
            ocrText: "QUARTERLY REPORT 2024\n\nRevenue: $1.2M\nGrowth: +15%\nStatus: CONFIDENTIAL",
            confidence: 0.98
        };
    } else {
        return {
            description: "A modern workspace setup featuring a laptop, a cup of coffee, and smart glasses on a wooden desk.",
            detectedObjects: ["Laptop", "Coffee Cup", "Smart Glasses", "Plant", "Desk"],
            ocrText: null,
            confidence: 0.95
        };
    }
  }

  // --- Translation (Mock) ---
  
  async sttOnce(audio: Blob): Promise<string> {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockPhrases = [
          "Hello, how are you today?",
          "Where is the nearest train station?",
          "I would like to order a coffee.",
          "Can you help me with this project?",
          "The weather is beautiful this morning."
      ];
      
      return mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
  }

  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simple Mock Translation Logic
      if (targetLang === 'Vietnamese') return `[Dịch] ${text} (in Vietnamese)`;
      if (targetLang === 'Spanish') return `[Traducido] ${text} (in Spanish)`;
      if (targetLang === 'Japanese') return `[翻訳] ${text} (in Japanese)`;
      
      return `[Translated to ${targetLang}] ${text}`;
  }

  // --- Chat (Mock Streaming) ---
  
  async *chatStream(history: ChatMessage[], newMessage: string, image?: string): AsyncGenerator<string> {
    // Simulate initial latency
    await new Promise(r => setTimeout(r, 600));

    let responseText = "";

    if (image) {
        responseText = "I see the image you uploaded. It looks fascinating! Based on visual analysis, this appears to be relevant to your query. ";
    }

    const responses = [
        "I can certainly help you with that. The Mercy system is fully operational.",
        "That's an interesting question. Let me access my database...",
        "According to my latest update, the answer depends on the context.",
        "Could you provide more details? I want to be as accurate as possible.",
        "I've updated your preferences based on that information."
    ];
    
    // Pick a random response base if no specific logic
    responseText += responses[Math.floor(Math.random() * responses.length)] + " Is there anything else you need?";

    // Stream character by character or word by word
    const words = responseText.split(" ");
    
    for (const word of words) {
        yield word + " ";
        // Random delay between words for realistic typing effect
        await new Promise(r => setTimeout(r, Math.random() * 50 + 20));
    }
  }
}

// Singleton instance for dependency injection
export const aiGateway = new MockAIGateway();
