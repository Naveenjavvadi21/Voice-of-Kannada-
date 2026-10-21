// TypeScript interface for Web Speech Recognition API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListeningState = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'kn-IN';
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public startListening(callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (errorMessage: string, isPermissionDenied?: boolean) => void;
    onStateChange: (isListening: boolean) => void;
  }): void {
    if (!this.recognition) {
      callbacks.onError('Web Speech Recognition is not supported on this browser. Please use the "Type instead" option.');
      return;
    }

    try {
      this.recognition.abort();
    } catch {
      // ignore
    }

    this.recognition.onstart = () => {
      this.isListeningState = true;
      callbacks.onStateChange(true);
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      callbacks.onResult(text, !!finalTranscript);
    };

    this.recognition.onerror = (event: any) => {
      this.isListeningState = false;
      callbacks.onStateChange(false);

      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        callbacks.onError('Microphone access was denied. Please allow microphone permissions or use typing mode.', true);
      } else if (event.error === 'no-speech') {
        callbacks.onError('No speech was detected. Please try tapping the mic and speaking again.');
      } else if (event.error === 'network') {
        callbacks.onError('Network connection error for speech recognition. Demo Mode / Typing fallback is available.');
      } else {
        callbacks.onError(`Speech recognition error: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      this.isListeningState = false;
      callbacks.onStateChange(false);
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isListeningState = false;
      callbacks.onStateChange(false);
      callbacks.onError('Could not start microphone. Please try again.');
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListeningState) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListeningState = false;
    }
  }

  public isListening(): boolean {
    return this.isListeningState;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
