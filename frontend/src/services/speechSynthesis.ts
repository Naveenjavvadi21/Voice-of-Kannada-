class SpeechSynthesisService {
  private isSpeakingState = false;
  private kannadaVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.initVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Look for kn-IN or kn voice
    this.kannadaVoice =
      voices.find((v) => v.lang.toLowerCase() === 'kn-in' || v.lang.toLowerCase().startsWith('kn')) ||
      voices.find((v) => v.lang.toLowerCase().includes('in') && v.name.toLowerCase().includes('india')) ||
      null;
  }

  public speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      options?.onEnd?.();
      return;
    }

    // Cancel previous utterance
    window.speechSynthesis.cancel();

    if (!text || !text.trim()) {
      options?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = 'kn-IN';
    utterance.rate = options?.rate ?? 0.88; // Slightly deliberate for language learners
    utterance.pitch = options?.pitch ?? 1.0;

    if (this.kannadaVoice) {
      utterance.voice = this.kannadaVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingState = true;
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeakingState = false;
      console.warn('SpeechSynthesis error:', e);
      options?.onError?.(e);
      options?.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeakingState = false;
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }
}

export const speechService = new SpeechSynthesisService();
