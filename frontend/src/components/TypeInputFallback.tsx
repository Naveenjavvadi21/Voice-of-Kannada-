import React, { useState } from 'react';
import { Send, Keyboard, X } from 'lucide-react';

interface TypeInputFallbackProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export const TypeInputFallback: React.FC<TypeInputFallbackProps> = ({
  onSend,
  isLoading,
  isOpen,
  onToggle
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSend(inputText.trim());
    setInputText('');
  };

  return (
    <div className="w-full">
      {!isOpen ? (
        <div className="flex justify-center">
          <button
            onClick={onToggle}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-red-900 bg-white/70 hover:bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm transition active:scale-95"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Type instead (if in noisy room)</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-2.5 rounded-2xl shadow-lg animate-fade-in">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <Keyboard className="w-3 h-3 text-red-800" />
              <span>Type your reply in Kannada script or English transliteration:</span>
            </span>
            <button
              type="button"
              onClick={onToggle}
              className="text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Namaskara, Indiranagarakke bartheera?"
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700/50 focus:border-red-700"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-[#9B111E] hover:bg-[#830E19] disabled:opacity-40 text-amber-300 p-2 rounded-xl shadow transition active:scale-95 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
