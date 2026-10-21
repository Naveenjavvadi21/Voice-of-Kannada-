import React, { useState } from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import type { PronunciationResponse } from '../types';
import { evaluatePronunciation } from '../services/api';
import { speechRecognitionService } from '../services/speechRecognition';
import { speechService } from '../services/speechSynthesis';
import { addXP } from '../services/storage';
import { MicButton } from '../components/MicButton';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { PronunciationModal } from '../components/PronunciationModal';

interface PronouncePracticeProps {
  onXPAdded: () => void;
}

const CHALLENGE_DRILLS = [
  {
    target: 'ಧನ್ಯವಾದಗಳು',
    transliteration: 'Dhanyavaadagalu',
    meaning: 'Thank you very much',
    challenge: 'Aspirated "ಧ" (dh) & plural "-ಗಳು" suffix'
  },
  {
    target: 'ಬೆಂಗಳೂರು ಚೆನ್ನಾಗಿದೆ',
    transliteration: 'Bengalooru chennaagide',
    meaning: 'Bengaluru is very nice',
    challenge: 'Long vowel "ಊ" and conjunct consonant "ನ್ನ"'
  },
  {
    target: 'ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ',
    transliteration: 'Dayavittu sahaaya maadi',
    meaning: 'Please help me',
    challenge: 'Doubled consonant "ಟ್ಟ" in Dayavittu'
  },
  {
    target: 'ಮೀಟರ್ ಹಾಕಿ ಅಣ್ಣ',
    transliteration: 'Meter haaki anna',
    meaning: 'Turn on the meter, brother',
    challenge: 'Clear release on "ಹಾಕಿ" and doubled "ಣ್ಣ"'
  },
  {
    target: 'ಊಟ ತುಂಬಾ ರುಚಿಯಾಗಿದೆ',
    transliteration: 'Oota tumba ruchiyagide',
    meaning: 'The food is very delicious',
    challenge: 'Long initial vowel "ಊ" and soft "ಚ"'
  },
  {
    target: 'ನನಗೆ ಕನ್ನಡ ಕಲಿಯಲು ಇಷ್ಟ',
    transliteration: 'Nanage kannada kaliyalu ishta',
    meaning: 'I like learning Kannada',
    challenge: 'Retroflex "ಷ್ಟ" (shta) sound'
  }
];

export const PronouncePractice: React.FC<PronouncePracticeProps> = ({ onXPAdded }) => {
  const [selectedDrill, setSelectedDrill] = useState(CHALLENGE_DRILLS[0]);
  const [customPhrase, setCustomPhrase] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [result, setResult] = useState<PronunciationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeTarget = customPhrase.trim() || selectedDrill.target;

  const handleStartEvaluation = async (spoken: string) => {
    setIsLoading(true);
    try {
      const evalResult = await evaluatePronunciation(activeTarget, spoken);
      setResult(evalResult);
      setIsModalOpen(true);
      addXP(50);
      onXPAdded();
    } catch (err) {
      console.warn('Evaluation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      speechRecognitionService.stopListening();
      if (recognizedText.trim()) {
        handleStartEvaluation(recognizedText.trim());
      }
    } else {
      setRecognizedText('');
      speechRecognitionService.startListening({
        onResult: (text, isFinal) => {
          setRecognizedText(text);
          if (isFinal && text.trim()) {
            handleStartEvaluation(text.trim());
          }
        },
        onError: () => {},
        onStateChange: (state) => setIsListening(state)
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-28">
      {/* Title */}
      <div className="mb-4 text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-red-900 bg-red-100 px-3 py-1 rounded-full">
          Phonetic Gym (ಉಚ್ಚಾರಣೆ ಕಲಿ)
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-2">
          Pronunciation Coaching & Diagnostic
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Master Kannada sounds with real-time phonetic feedback and lenient accent tolerance.
        </p>
      </div>

      {/* Target Phrase Spotlight Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-md relative overflow-hidden mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            Target Expression
          </span>
          <button
            onClick={() => speechService.speak(activeTarget, { rate: 0.8 })}
            className="flex items-center space-x-1.5 text-xs font-bold text-red-900 hover:text-red-950 bg-amber-100/70 hover:bg-amber-200/80 px-3 py-1.5 rounded-full transition active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>Hear Native Model</span>
          </button>
        </div>

        <div className="my-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {activeTarget}
          </div>
          {selectedDrill.transliteration && !customPhrase && (
            <div className="text-sm font-semibold text-amber-900 italic mt-1">
              "{selectedDrill.transliteration}"
            </div>
          )}
          {selectedDrill.meaning && !customPhrase && (
            <div className="text-xs text-slate-600 mt-0.5">
              Meaning: {selectedDrill.meaning}
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center space-x-2 text-xs text-red-900 font-medium">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Focal challenge: {selectedDrill.challenge}</span>
        </div>
      </div>

      {/* Mic Recording Area */}
      <div className="bg-amber-50/60 rounded-3xl p-6 border border-amber-200 flex flex-col items-center justify-center my-4">
        <AudioVisualizer isActive={isListening} color="#9B111E" label="Analyzing your pronunciation..." />

        {recognizedText && (
          <div className="my-2 p-2.5 bg-white border border-amber-300 rounded-2xl text-center max-w-md w-full animate-fade-in">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Recognized Speech:</span>
            <div className="text-base font-bold text-red-900">{recognizedText}</div>
          </div>
        )}

        <div className="mt-2">
          <MicButton
            isListening={isListening}
            onToggle={handleMicToggle}
            disabled={isLoading}
            helperText={isListening ? 'Listening... speak clearly!' : 'Tap to pronounce the phrase above'}
          />
        </div>

        {isLoading && (
          <div className="mt-3 flex items-center space-x-2 text-xs font-semibold text-slate-600">
            <div className="w-4 h-4 border-2 border-red-800 border-t-transparent rounded-full animate-spin" />
            <span>Scoring Aksharas and phonetics...</span>
          </div>
        )}
      </div>

      {/* Preset Challenge Drill Selection */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
          <span>Curated Pronunciation Drills</span>
          <span className="text-xs text-slate-500 font-normal">(Pick a phrase to test)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CHALLENGE_DRILLS.map((drill, idx) => {
            const isSelected = selectedDrill.target === drill.target && !customPhrase;
            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedDrill(drill);
                  setCustomPhrase('');
                  setRecognizedText('');
                  setResult(null);
                }}
                className={`p-3 rounded-2xl border cursor-pointer transition active:scale-98 ${
                  isSelected
                    ? 'bg-amber-100/70 border-red-700 ring-2 ring-red-700/20'
                    : 'bg-white border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{drill.target}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speechService.speak(drill.target, { rate: 0.8 });
                    }}
                    className="text-slate-400 hover:text-red-900 p-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-xs text-amber-900 italic">{drill.transliteration}</div>
                <div className="text-[11px] text-slate-500 mt-1">{drill.meaning}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phonetic Diagnostic Modal */}
      <PronunciationModal
        targetPhrase={activeTarget}
        targetTransliteration={selectedDrill.transliteration}
        result={result}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRetry={() => {
          setIsModalOpen(false);
          handleMicToggle();
        }}
      />
    </div>
  );
};
