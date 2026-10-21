import React from 'react';
import { Volume2, RotateCcw, CheckCircle2, AlertCircle, XCircle, Sparkles, X } from 'lucide-react';
import type { PronunciationResponse } from '../types';
import { speechService } from '../services/speechSynthesis';

interface PronunciationModalProps {
  targetPhrase: string;
  targetTransliteration?: string;
  result: PronunciationResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export const PronunciationModal: React.FC<PronunciationModalProps> = ({
  targetPhrase,
  targetTransliteration,
  result,
  isOpen,
  onClose,
  onRetry
}) => {
  if (!isOpen || !result) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 60) return 'text-amber-800 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 85) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#F43F5E';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200/50 relative overflow-hidden">
        {/* Top Decorative Karnataka Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-red-600 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center pt-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-red-900 bg-red-100/70 px-3 py-1 rounded-full">
            Pronunciation Diagnostic
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-2">
            ಉಚ್ಚಾರಣೆ ವಿಶ್ಲೇಷಣೆ (Voice Feedback)
          </h3>
        </div>

        {/* Score Ring / Badge */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#E2E8F0"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={getScoreRingColor(result.score)}
                strokeWidth="10"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * result.score) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {result.score}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">out of 100</span>
            </div>
          </div>

          <div className={`mt-3 px-4 py-1.5 rounded-full border text-sm font-bold text-center ${getScoreColor(result.score)}`}>
            {result.verdict}
          </div>
        </div>

        {/* Target Phrase Box */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 my-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-amber-900/80 uppercase">Target Phrase</span>
            <button
              onClick={() => speechService.speak(targetPhrase, { rate: 0.8 })}
              className="flex items-center space-x-1 text-xs text-red-800 font-bold hover:underline"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Hear Tutor</span>
            </button>
          </div>
          <div className="text-lg font-bold text-red-950">{targetPhrase}</div>
          {targetTransliteration && (
            <div className="text-xs text-slate-600 italic mt-0.5">{targetTransliteration}</div>
          )}
        </div>

        {/* Word-by-Word Breakdown */}
        <div className="my-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Word-by-Word Analysis
          </span>
          <div className="flex flex-wrap gap-2">
            {result.words.map((item, idx) => {
              const isCorrect = item.status === 'correct';
              const isWarning = item.status === 'warning';
              return (
                <div
                  key={idx}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                    isCorrect
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : isWarning
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {isWarning && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                  {!isCorrect && !isWarning && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                  <span>{item.word}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actionable Phonetic Coaching Tip */}
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-3.5 my-3 text-xs text-red-950">
          <div className="flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-900">Coaching Tip: </span>
              <span>{result.actionable_tip}</span>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center space-x-3 mt-4 pt-2 border-t border-slate-100">
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center space-x-2 bg-[#9B111E] hover:bg-[#830E19] text-amber-300 font-bold py-3 px-4 rounded-2xl shadow transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Speaking Again</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
