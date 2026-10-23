// Browser Web Speech API for Speech-to-Text (STT) and Text-to-Speech (TTS)

export interface SpeechRecognitionHandlers {
  onStart?: () => void;
  onInterimResult?: (transcript: string) => void;
  onFinalResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

// Check Web Speech API support
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

export class SpeechToTextController {
  private recognition: any = null;
  private isListening = false;
  private handlers: SpeechRecognitionHandlers = {};
  private interimTranscript = '';
  private finalTranscript = '';

  constructor(handlers: SpeechRecognitionHandlers) {
    this.handlers = handlers;
    this.initRecognition();
  }

  private initRecognition() {
    if (!isSpeechRecognitionSupported()) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN'; // Indian English / English

      this.recognition.onstart = () => {
        this.isListening = true;
        this.handlers.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let newlyFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newlyFinal += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (newlyFinal) {
          this.finalTranscript += newlyFinal;
          this.handlers.onFinalResult?.(newlyFinal.trim());
        }

        this.interimTranscript = interim;
        this.handlers.onInterimResult?.(interim);
      };

      this.recognition.onerror = (event: any) => {
        let msg = 'Speech recognition error';
        if (event.error === 'not-allowed') {
          msg = 'Microphone permission was denied. Please allow microphone access in browser settings.';
        } else if (event.error === 'no-speech') {
          msg = 'No speech detected. Listening paused.';
        } else if (event.error === 'audio-capture') {
          msg = 'No microphone device found on this system.';
        } else if (event.error === 'network') {
          msg = 'Network error occurred during speech transcription.';
        }
        this.handlers.onError?.(msg);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.handlers.onEnd?.();
      };
    } catch (e) {
      console.warn('SpeechRecognition initialization failed:', e);
    }
  }

  public start() {
    if (!this.recognition) {
      this.handlers.onError?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or manual text input.');
      return;
    }
    if (this.isListening) return;

    try {
      this.interimTranscript = '';
      this.recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
    }
  }

  public stop() {
    if (!this.recognition || !this.isListening) return;
    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (e) {
      console.error('Failed to stop speech recognition:', e);
    }
  }

  public getStatus(): boolean {
    return this.isListening;
  }

  public clear() {
    this.interimTranscript = '';
    this.finalTranscript = '';
  }
}

/**
 * Text-to-Speech synthesizer
 */
export function speakText(
  text: string,
  options: { rate?: number; pitch?: number; onEnd?: () => void } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSynthesisSupported()) {
      console.warn('Speech synthesis not supported in this browser.');
      resolve();
      return;
    }

    if (!text || !text.trim()) {
      resolve();
      return;
    }

    // Cancel existing utterance to prevent speech overlap
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = Math.max(0.5, Math.min(1.5, options.rate || 1.0));
    utterance.pitch = Math.max(0.5, Math.min(1.5, options.pitch || 1.0));

    // Prefer English voices (India, UK, US)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-IN')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      options.onEnd?.();
      resolve();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}
