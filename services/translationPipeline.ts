
import { translateText } from './geminiService';

// --- Types ---

export type PipelineState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'PAUSED' | 'ERROR';

export interface TranscriptEvent {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: number;
}

export interface TranslationEvent {
  sourceId: string; // Links back to the source transcript
  text: string;
  language: string;
}

type Listener<T> = (data: T) => void;

// --- Helper: Language Mapping ---
const getLangCode = (name: string): string => {
    const map: Record<string, string> = {
        'English': 'en-US',
        'Vietnamese': 'vi-VN',
        'Spanish': 'es-ES',
        'Japanese': 'ja-JP',
        'Korean': 'ko-KR',
        'Chinese': 'zh-CN',
        'French': 'fr-FR',
        'German': 'de-DE'
    };
    return map[name] || 'en-US';
};

// --- 1. Audio Stream Source (Real) ---
class RealAudioSource {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private animationId: number | null = null;
  private listeners: Listener<number>[] = [];

  subscribe(callback: Listener<number>) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async start() {
    try {
      if (!this.audioContext) {
         this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Critical for mobile: Resume context inside the user gesture if possible
      if (this.audioContext.state === 'suspended') {
         await this.audioContext.resume();
      }

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);
      this.analyser.fftSize = 32;
      
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const update = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for(let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const level = Math.min(100, (average / 255) * 200); 
        this.listeners.forEach(cb => cb(level));
        
        this.animationId = requestAnimationFrame(update);
      };

      update();
    } catch (e) {
      console.error("Audio Access Error", e);
      throw e; 
    }
  }

  stop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.microphone) {
        try { this.microphone.disconnect(); } catch(e){}
    }
    if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
    }
    this.stream = null;
    this.listeners.forEach(cb => cb(0)); 
  }
}

// --- 2. STT Stream (Real: Web Speech API) ---
class RealSTTEngine {
  private recognition: any = null; 
  private isRunning = false;
  private listeners: Listener<TranscriptEvent>[] = [];
  private currentLanguage = 'en-US';
  
  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        
        this.recognition.onresult = (event: any) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const result = event.results[i];
                const text = result[0].transcript;
                const isFinal = result.isFinal;
                const id = `trans_${Date.now()}_${i}`;

                this.emit({
                    id: isFinal ? id : 'interim_current',
                    text: text.trim(),
                    isFinal: isFinal,
                    timestamp: Date.now()
                });
            }
        };

        this.recognition.onend = () => {
            if (this.isRunning) {
                try { 
                    this.recognition.start(); 
                } catch(e) {
                    console.warn("STT Auto-restart failed", e);
                }
            }
        };

        this.recognition.onerror = (event: any) => {
             console.error("Speech Recognition Error", event.error);
             if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                 this.isRunning = false;
             }
        };
    }
  }

  setLanguage(langCode: string) {
      this.currentLanguage = langCode;
      if (this.recognition) this.recognition.lang = langCode;
  }

  subscribe(callback: Listener<TranscriptEvent>) {
    this.listeners.push(callback);
    return () => {
        this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  start() {
    if (!this.recognition) {
        throw new Error("Speech Recognition not supported in this browser.");
    }
    this.isRunning = true;
    this.recognition.lang = this.currentLanguage;
    try {
        this.recognition.start();
    } catch (e: any) {
        if (e.message && e.message.includes('already started')) {
             return;
        }
        throw e;
    }
  }

  stop() {
    this.isRunning = false;
    if (this.recognition) {
        try {
            this.recognition.stop();
        } catch(e) {} 
    }
  }

  private emit(event: TranscriptEvent) {
    this.listeners.forEach(cb => cb(event));
  }
}

// --- 3. Translation Stream (Real: Gemini) ---
class RealTranslatorEngine {
  async translate(text: string, sourceLangName: string, targetLangName: string): Promise<string> {
    if (!text || text.length < 2) return "";
    try {
        return await translateText(text, targetLangName, sourceLangName);
    } catch (e) {
        console.error("Translation Engine Error", e);
        return `[Error] ${text}`; 
    }
  }
}

// --- 4. TTS Engine (Real: Web Speech API) ---
class RealTTSEngine {
  private enabled = true;
  // Hold reference to prevent garbage collection bug in Chrome/Safari
  private currentUtterance: SpeechSynthesisUtterance | null = null; 

  constructor() {
      // Pre-load voices if possible
      if (typeof window !== 'undefined' && window.speechSynthesis) {
          // Trigger voice loading
          window.speechSynthesis.getVoices();
          // Ensure voices are loaded when they change (async)
          window.speechSynthesis.onvoiceschanged = () => {
              console.log("Voices loaded:", window.speechSynthesis.getVoices().length);
          };
      }
  }

  setEnabled(enabled: boolean) {
      this.enabled = enabled;
      if (!enabled) this.stop();
  }

  // Call this from a user click event to unlock audio on mobile
  warmup() {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      window.speechSynthesis.speak(u);
  }

  speak(text: string, langName: string) {
      if (!this.enabled || !text) return;
      if (typeof window === 'undefined' || !window.speechSynthesis) {
          console.warn("TTS not supported");
          return;
      }

      // Cancel previous to avoid queue buildup
      window.speechSynthesis.cancel();

      const langCode = getLangCode(langName);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 1.0; 
      utterance.volume = 1.0;

      // Robust Voice Selection
      const voices = window.speechSynthesis.getVoices();
      // 1. Try exact match (e.g., vi-VN)
      let preferredVoice = voices.find(v => v.lang === langCode);
      // 2. Try base language match (e.g., vi)
      if (!preferredVoice) {
          const baseLang = langCode.split('-')[0];
          preferredVoice = voices.find(v => v.lang.startsWith(baseLang));
      }
      
      if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log(`TTS using voice: ${preferredVoice.name} (${preferredVoice.lang})`);
      } else {
          console.warn(`No specific voice found for ${langCode}, using system default.`);
      }

      // Error handling
      utterance.onerror = (e) => {
          console.error("TTS Error:", e);
      };

      // Assign to class property to prevent GC
      this.currentUtterance = utterance;
      utterance.onend = () => {
          this.currentUtterance = null;
      };

      window.speechSynthesis.speak(utterance);
  }

  stop() {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
      }
      this.currentUtterance = null;
  }
}

// --- 5. Pipeline Controller ---
export class SimultaneousPipeline {
  private audioSource = new RealAudioSource();
  private sttEngine = new RealSTTEngine();
  private translator = new RealTranslatorEngine();
  private ttsEngine = new RealTTSEngine();
  
  private _status: PipelineState = 'IDLE';
  private sourceLangName: string = 'English';
  private targetLangName: string = 'Vietnamese';
  
  // Event Emitters
  public onStatusChange: ((status: PipelineState) => void) | null = null;
  public onAudioLevel: ((level: number) => void) | null = null;
  public onSourceTranscript: ((event: TranscriptEvent) => void) | null = null;
  public onTranslation: ((event: TranslationEvent) => void) | null = null;
  public onError: ((error: string) => void) | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Bind Audio Source
    this.audioSource.subscribe((level) => {
        if (this.onAudioLevel) this.onAudioLevel(level);
    });

    // Bind STT -> Logic -> Translation
    this.sttEngine.subscribe(async (evt) => {
        if (this.onSourceTranscript) this.onSourceTranscript(evt);

        if (evt.isFinal && evt.text.length > 0) {
            try {
                // Call Gemini for Translation
                const translatedText = await this.translator.translate(
                    evt.text, 
                    this.sourceLangName, 
                    this.targetLangName
                );
                
                // Emit event
                if (this.onTranslation) {
                    this.onTranslation({
                        sourceId: evt.id,
                        text: translatedText,
                        language: this.targetLangName
                    });
                }

                // Speak the result
                console.log(`Speaking: ${translatedText}`);
                this.ttsEngine.speak(translatedText, this.targetLangName);

            } catch (e) {
                console.warn("Translation partial failure");
            }
        }
    });
  }

  // New method to be called on user interaction
  public prepareAudio() {
      this.ttsEngine.warmup();
  }

  public setAudioOutput(enabled: boolean) {
      this.ttsEngine.setEnabled(enabled);
  }

  public async start(sourceLang: string = 'English', targetLang: string = 'Vietnamese') {
    if (this._status === 'LISTENING') return;
    
    this.sourceLangName = sourceLang;
    this.targetLangName = targetLang;

    try {
        this.sttEngine.setLanguage(getLangCode(sourceLang));
        this.setStatus('LISTENING');
        
        // Ensure TTS is clean before starting
        this.ttsEngine.stop();
        
        this.sttEngine.start();

        this.audioSource.start().catch((e) => {
            console.error("Audio Visualizer Failed", e);
            if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                 this.setStatus('ERROR');
                 this.sttEngine.stop();
                 if (this.onError) this.onError("Microphone permission denied.");
            }
        });

    } catch (e: any) {
        console.error("Pipeline Start Failed", e);
        this.setStatus('ERROR');
        this.audioSource.stop();
        
        let msg = "Failed to start listening.";
        if (e.message.includes('not supported')) msg = "Browser does not support Speech Recognition.";
        if (this.onError) this.onError(msg);
    }
  }

  public async pause() {
    this.setStatus('PAUSED');
    this.audioSource.stop();
    this.sttEngine.stop();
    this.ttsEngine.stop();
  }

  public async stop() {
    this.setStatus('IDLE');
    this.audioSource.stop();
    this.sttEngine.stop();
    this.ttsEngine.stop();
  }

  private setStatus(s: PipelineState) {
      this._status = s;
      if (this.onStatusChange) this.onStatusChange(s);
  }

  public get status() {
      return this._status;
  }
}
