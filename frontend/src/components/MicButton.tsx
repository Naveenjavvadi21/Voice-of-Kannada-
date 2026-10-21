import React from 'react';
import { Mic, Square } from 'lucide-react';

interface MicButtonProps {
  isListening: boolean;
  onToggle: () => void;
  disabled?: boolean;
  helperText?: string;
}

export const MicButton: React.FC<MicButtonProps> = ({
  isListening,
  onToggle,
  disabled = false,
  helperText
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        {/* Pulsing Outer Aura when Listening */}
        {isListening && (
          <div className="absolute inset-0 rounded-full bg-red-600/30 animate-pulse-ring pointer-events-none" />
        )}

        {/* Primary Interactive Button */}
        <button
          onClick={onToggle}
          disabled={disabled}
          aria-label={isListening ? 'Stop listening' : 'Start speaking in Kannada'}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            isListening
              ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-red-500/50 scale-105'
              : 'bg-gradient-to-tr from-[#9B111E] to-red-700 hover:from-[#830E19] hover:to-red-800 text-amber-300 shadow-red-900/40 hover:scale-105 ring-4 ring-amber-400/30'
          }`}
        >
          {isListening ? (
            <div className="flex flex-col items-center">
              <Square className="w-8 h-8 fill-current text-white animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Stop</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Mic className="w-9 h-9" />
              <span className="text-[10px] font-semibold text-amber-200 mt-0.5">Speak</span>
            </div>
          )}
        </button>
      </div>

      {/* Helper caption */}
      <p className="mt-2 text-xs font-medium text-slate-500 text-center max-w-xs">
        {helperText || (isListening ? 'Listening to your Kannada... tap to finish' : 'Tap to speak in Kannada')}
      </p>
    </div>
  );
};
