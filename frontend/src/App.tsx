import React, { useState, useEffect } from 'react';
import { Mic, Target, Sparkles, BookOpen } from 'lucide-react';
import type { UserProgress } from './types';
import { getStoredProgress, setStoredLevel } from './services/storage';
import { Header } from './components/Header';
import { VoiceTutorView } from './views/VoiceTutorView';
import { MissionsView } from './views/MissionsView';
import { PronouncePractice } from './views/PronouncePractice';
import { PhrasebookView } from './views/PhrasebookView';

type NavTab = 'tutor' | 'missions' | 'pronounce' | 'phrasebook';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('tutor');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [progress, setProgress] = useState<UserProgress>(getStoredProgress());

  useEffect(() => {
    setProgress(getStoredProgress());
  }, []);

  const handleToggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const handleToggleLevel = () => {
    const nextLevel = progress.learnerLevel === 'beginner' ? 'intermediate' : 'beginner';
    const updated = setStoredLevel(nextLevel);
    setProgress(updated);
  };

  const refreshProgress = () => {
    setProgress(getStoredProgress());
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <Header
        progress={progress}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        onToggleLevel={handleToggleLevel}
      />

      {/* Demo Mode Notice Bar (if Demo Mode is active) */}
      {isDemoMode && (
        <div className="bg-amber-400 text-red-950 px-4 py-1.5 text-xs font-bold text-center border-b border-amber-500 shadow-xs flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-700 animate-ping" />
          <span>Demo Safety Mode Active: Running with guaranteed zero-latency offline fallbacks.</span>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 w-full overflow-y-auto">
        {activeTab === 'tutor' && (
          <VoiceTutorView
            isDemoMode={isDemoMode}
            learnerLevel={progress.learnerLevel}
            onXPAdded={refreshProgress}
          />
        )}

        {activeTab === 'missions' && (
          <MissionsView
            isDemoMode={isDemoMode}
            learnerLevel={progress.learnerLevel}
            completedScenarioIds={progress.completedScenarioIds}
            onMissionCompleted={refreshProgress}
          />
        )}

        {activeTab === 'pronounce' && (
          <PronouncePractice onXPAdded={refreshProgress} />
        )}

        {activeTab === 'phrasebook' && (
          <PhrasebookView
            favoriteIds={progress.favoritePhraseIds}
            onFavoritesChanged={() => refreshProgress()}
          />
        )}
      </main>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('tutor')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition active:scale-95 ${
              activeTab === 'tutor'
                ? 'text-[#9B111E] font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'tutor' ? 'bg-red-50' : ''}`}>
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">Tutor</span>
          </button>

          <button
            onClick={() => setActiveTab('missions')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition active:scale-95 ${
              activeTab === 'missions'
                ? 'text-[#9B111E] font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'missions' ? 'bg-red-50' : ''}`}>
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">Missions</span>
          </button>

          <button
            onClick={() => setActiveTab('pronounce')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition active:scale-95 ${
              activeTab === 'pronounce'
                ? 'text-[#9B111E] font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'pronounce' ? 'bg-red-50' : ''}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">Pronounce</span>
          </button>

          <button
            onClick={() => setActiveTab('phrasebook')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition active:scale-95 ${
              activeTab === 'phrasebook'
                ? 'text-[#9B111E] font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'phrasebook' ? 'bg-red-50' : ''}`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">Phrases</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
