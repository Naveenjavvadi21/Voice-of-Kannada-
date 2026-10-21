import React, { useState } from 'react';
import { Volume2, X } from 'lucide-react';
import { speechService } from '../services/speechSynthesis';

interface WordTappableProps {
  kannadaText: string;
  className?: string;
  onWordClick?: (word: string) => void;
}

// Common dictionary hints for instant offline word lookups
const WORD_DICTIONARY: Record<string, { transliteration: string; meaning: string }> = {
  'ನಮಸ್ಕಾರ': { transliteration: 'Namaskara', meaning: 'Hello / Greetings' },
  'ಸ್ವಾಮಿ': { transliteration: 'Swami', meaning: 'Sir / Gentleman (Respectful)' },
  'ಅಣ್ಣ': { transliteration: 'Anna', meaning: 'Elder brother (Everyday polite address)' },
  'ರೀ': { transliteration: 'Ree', meaning: 'Respectful address marker' },
  'ಎಲ್ಲಿಗೆ': { transliteration: 'Ellige', meaning: 'Where to?' },
  'ಹೋಗ್ಬೇಕು': { transliteration: 'Hogbeku', meaning: 'Must go / Need to go' },
  'ಬರ್ತೀರಾ': { transliteration: 'Bartheera', meaning: 'Will you come?' },
  'ಮೀಟರ್': { transliteration: 'Meter', meaning: 'Fare meter' },
  'ಹಾಕಿ': { transliteration: 'Haaki', meaning: 'Put / Turn on' },
  'ಎಷ್ಟು': { transliteration: 'Eshtu', meaning: 'How much / How many' },
  'ಆಯ್ತು': { transliteration: 'Aaythu', meaning: 'Became / Happened / Totaled' },
  'ರೂಪಾಯಿ': { transliteration: 'Roopaayi', meaning: 'Rupees (Currency)' },
  'ಇಲ್ಲಿ': { transliteration: 'Illi', meaning: 'Here' },
  'ನಿಲ್ಲಿಸಿ': { transliteration: 'Nillisi', meaning: 'Stop (Imperative polite)' },
  'ಸೀದಾ': { transliteration: 'Seeda', meaning: 'Straight' },
  'ಹೋಗಿ': { transliteration: 'Hogi', meaning: 'Go (Polite)' },
  'ಬಲಕ್ಕೆ': { transliteration: 'Balakke', meaning: 'To the right' },
  'ಎಡಕ್ಕೆ': { transliteration: 'Edakke', meaning: 'To the left' },
  'ತಿರುಗಿ': { transliteration: 'Thirugi', meaning: 'Turn' },
  'ಧನ್ಯವಾದಗಳು': { transliteration: 'Dhanyavaadagalu', meaning: 'Thank you very much' },
  'ದಯವಿಟ್ಟು': { transliteration: 'Dayavittu', meaning: 'Please' },
  'ಕ್ಷಮಿಸಿ': { transliteration: 'Kshamisi', meaning: 'Excuse me / Sorry' },
  'ಪರವಾಗಿಲ್ಲ': { transliteration: 'Paravaagilla', meaning: "It's fine / No problem" },
  'ಊಟ': { transliteration: 'Oota', meaning: 'Meal / Lunch / Dinner' },
  'ಆಯ್ತಾ': { transliteration: 'Aaytha', meaning: 'Is it done?' },
  'ತಿಂಡಿ': { transliteration: 'Thindi', meaning: 'Snacks / Breakfast' },
  'ದೋಸೆ': { transliteration: 'Dose', meaning: 'Crispy rice-lentil pancake' },
  'ಮಸಾಲೆ': { transliteration: 'Masale', meaning: 'Spiced potato filling' },
  'ಕಾಫಿ': { transliteration: 'Coffee', meaning: 'Filter coffee' },
  'ಬಿಸಿ': { transliteration: 'Bisi', meaning: 'Hot / Fresh' },
  'ನೀರು': { transliteration: 'Neeru', meaning: 'Water' },
  'ಕೊಡಿ': { transliteration: 'Kodi', meaning: 'Please give' },
  'ಖಾರ': { transliteration: 'Khaara', meaning: 'Spiciness' },
  'ಕಡಿಮೆ': { transliteration: 'Kadime', meaning: 'Less / Reduced' },
  'ಮಾಡಿ': { transliteration: 'Maadi', meaning: 'Do / Make' },
  'ಸಕ್ಕರೆ': { transliteration: 'Sakkare', meaning: 'Sugar' },
  'ಬೇಕು': { transliteration: 'Beku', meaning: 'Want / Need' },
  'ಬೇಡ': { transliteration: 'Beda', meaning: 'Do not want / No' },
  'ಹೌದು': { transliteration: 'Haudu', meaning: 'Yes' },
  'ಇಲ್ಲ': { transliteration: 'Illa', meaning: 'No / None' },
  'ಗೊತ್ತು': { transliteration: 'Gottu', meaning: 'Known' },
  'ಗೊತ್ತಿಲ್ಲ': { transliteration: 'Gottilla', meaning: 'Do not know' },
  'ಕನ್ನಡ': { transliteration: 'Kannada', meaning: 'The Kannada language & culture' },
  'ಕಲಿಯುತ್ತಿದ್ದೇನೆ': { transliteration: 'Kaliyuttiddene', meaning: 'I am learning' },
  'ಮಾತನಾಡಿ': { transliteration: 'Maathnaadi', meaning: 'Please speak' },
  'ನಿಧಾನವಾಗಿ': { transliteration: 'Nidhaanavaagi', meaning: 'Slowly / Gently' },
  'ತುಂಬಾ': { transliteration: 'Tumba', meaning: 'Very / A lot' },
  'ರುಚಿಯಾಗಿದೆ': { transliteration: 'Ruchiyagide', meaning: 'Is delicious' },
  'ಚೆನ್ನಾಗಿದೆ': { transliteration: 'Chennaagide', meaning: 'Is good / Nice' }
};

export const WordTappable: React.FC<WordTappableProps> = ({
  kannadaText,
  className = '',
  onWordClick
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // Split words while preserving punctuation
  const tokens = kannadaText.split(/(\s+)/);

  const handleWordTap = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanWord = word.replace(/[.,!?;:()"]/g, '').trim();
    if (!cleanWord) return;

    setSelectedWord(cleanWord);
    speechService.speak(cleanWord, { rate: 0.8 });
    onWordClick?.(cleanWord);
  };

  const selectedWordInfo = selectedWord ? WORD_DICTIONARY[selectedWord] : null;

  return (
    <div className={`relative inline-block ${className}`}>
      <span className="flex flex-wrap gap-x-1 gap-y-0.5 items-center leading-relaxed">
        {tokens.map((token, index) => {
          const isWhitespace = /^\s+$/.test(token);
          if (isWhitespace) {
            return <span key={index}> </span>;
          }

          const clean = token.replace(/[.,!?;:()"]/g, '').trim();
          const isSelected = selectedWord === clean;

          return (
            <span
              key={index}
              onClick={(e) => handleWordTap(token, e)}
              className={`cursor-pointer px-1 py-0.5 rounded transition-all duration-150 inline-flex items-center active:scale-95 select-none ${
                isSelected
                  ? 'bg-amber-300 text-amber-950 font-bold ring-2 ring-amber-500 shadow-sm'
                  : 'hover:bg-amber-100 hover:text-red-950 decoration-amber-400/40 hover:underline'
              }`}
              title={`Tap to hear '${clean}'`}
            >
              {token}
            </span>
          );
        })}
      </span>

      {/* Floating Word Popover */}
      {selectedWord && (
        <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded-xl shadow-md text-xs text-amber-950 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => speechService.speak(selectedWord, { rate: 0.8 })}
              className="w-7 h-7 rounded-full bg-amber-200 hover:bg-amber-300 flex items-center justify-center text-amber-900 transition active:scale-90"
              title="Listen again"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <div>
              <div className="font-bold text-sm text-red-900 flex items-center gap-1.5">
                <span>{selectedWord}</span>
                {selectedWordInfo && (
                  <span className="text-[11px] font-normal text-slate-600 italic">
                    ({selectedWordInfo.transliteration})
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-700">
                {selectedWordInfo?.meaning || 'Kannada vocabulary word'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedWord(null)}
            className="text-amber-800/60 hover:text-amber-950 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
