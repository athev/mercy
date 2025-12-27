import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";

// Standard Text Generation for Text-to-Text translation
export const translateText = async (text: string, targetLanguage: string, sourceLanguage: string = 'Auto'): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Robust prompt for translation
  const prompt = `
    Role: Professional Translator.
    Task: Translate the following text from ${sourceLanguage} to ${targetLanguage}.
    Source Text: "${text}"
    
    Rules:
    1. Output ONLY the translated text.
    2. Do not include notes, markdown code blocks, or explanations.
    3. Maintain the original tone and style.
  `;
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Translation failed.";
  } catch (error) {
    console.error("Translation error", error);
    return "Error during translation. Please try again.";
  }
};

// Image Analysis using Vision Capabilities
export const analyzeImage = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: "Analyze this image and provide a concise description of what you see. Focus on key objects, text, or context relevant to a smart glasses user."
          }
        ]
      }
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Vision error", error);
    return "Error analyzing image. Please try again.";
  }
};

// AI Assistant Chat (Streaming)
export const sendMessageStreamToAssistant = async function* (history: {role: string, parts: {text: string}[]}[], newMessage: string) {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: "You are the Mercy AI Assistant. You are embedded in a smart glasses app. You are helpful, concise, and knowledgeable. Keep answers short and relevant to mobile users. You can help with general knowledge, translations, and device information.",
      }
    });

    const result = await chat.sendMessageStream({ message: newMessage });
    
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Chat error", error);
    yield "Sorry, I'm having trouble connecting to the Mercy Network.";
  }
};