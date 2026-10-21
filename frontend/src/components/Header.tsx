import React from 'react';
import { Sparkles, Flame, BookOpen } from 'lucide-react';
import type { UserProgress } from '../types';

interface HeaderProps {
  progress: UserProgress;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onToggleLevel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  isDemoMode,
  onToggleDemoMode,
  onToggleLevel,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#9B111E] text-white shadow-md border-b-2 border-amber-500">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-amber-400 to-[#9B111E] p-0.5 shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-[#830E19] rounded-[10px] flex items-center justify-center font-bold text-amber-300 text-lg">
              ಕ
            </div>
          </div>
          <div>
            <h1 className="font-bold text-base md:text-lg leading-tight tracking-tight flex items-center gap-1.5">
              <span>ಕನ್ನಡದ ಧ್ವನಿ</span>
              <span className="text-xs bg-amber-400 text-red-950 font-semibold px-1.5 py-0.5 rounded-full">
                Hackathon 2026
              </span>
            </h1>
            <p className="text-xs text-amber-200/90 font-medium">Voice of Kannada • AI Spoken Tutor</p>
          </div>
        </div>

        {/* Stats & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Streak Counter */}
          <div
            className="flex items-center space-x-1 bg-black/25 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-300"
            title={`${progress.streakDays} day practice streak!`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span>{progress.streakDays}d</span>
          </div>

          {/* XP Counter */}
          <div
            className="flex items-center space-x-1 bg-amber-500/25 border border-amber-400/40 px-2.5 py-1 rounded-full text-xs font-bold text-amber-200"
            title={`${progress.xp} Total Learning XP`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>{progress.xp} XP</span>
          </div>

          {/* Level Toggle Button */}
          <button
            onClick={onToggleLevel}
            className="hidden sm:flex items-center space-x-1 bg-white/10 hover:bg-white/20 active:scale-95 transition px-2.5 py-1 rounded-full text-xs font-medium text-white border border-white/20"
            title="Click to toggle learner level"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span className="capitalize">{progress.learnerLevel}</span>
          </button>

          {/* Demo / Offline Safety Mode Toggle */}
          <button
            onClick={onToggleDemoMode}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition shadow-sm active:scale-95 ${
              isDemoMode
                ? 'bg-amber-400 text-red-950 ring-2 ring-amber-300'
                : 'bg-black/30 hover:bg-black/40 text-amber-100 border border-amber-400/30'
            }`}
            title="Toggle Demo Mode (Zero-latency offline safety for presentations)"
          >
            <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-red-700 animate-ping' : 'bg-emerald-400'}`} />
            <span className="hidden md:inline">{isDemoMode ? 'Demo Mode: ON' : 'Live Mode'}</span>
            <span className="md:hidden">{isDemoMode ? 'Demo' : 'Live'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
