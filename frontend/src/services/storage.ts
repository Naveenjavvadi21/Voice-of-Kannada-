import type { UserProgress } from '../types';

const STORAGE_KEY = 'vok_user_progress_v1';

const DEFAULT_PROGRESS: UserProgress = {
  xp: 120,
  streakDays: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedScenarioIds: [],
  favoritePhraseIds: ['p1', 'p10', 'p16'],
  phrasesPracticed: 8,
  learnerLevel: 'beginner'
};

export const getStoredProgress = (): UserProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PROGRESS;
  }
};

export const saveProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Failed to save user progress:', err);
  }
};

export const addXP = (amount: number): UserProgress => {
  const current = getStoredProgress();
  const updated = {
    ...current,
    xp: current.xp + amount,
    phrasesPracticed: current.phrasesPracticed + 1
  };
  saveProgress(updated);
  return updated;
};

export const toggleFavorite = (phraseId: string): UserProgress => {
  const current = getStoredProgress();
  const exists = current.favoritePhraseIds.includes(phraseId);
  const updatedFavorites = exists
    ? current.favoritePhraseIds.filter(id => id !== phraseId)
    : [...current.favoritePhraseIds, phraseId];

  const updated = {
    ...current,
    favoritePhraseIds: updatedFavorites
  };
  saveProgress(updated);
  return updated;
};

export const markScenarioComplete = (scenarioId: string): UserProgress => {
  const current = getStoredProgress();
  if (current.completedScenarioIds.includes(scenarioId)) {
    return current;
  }
  const updated = {
    ...current,
    xp: current.xp + 150,
    completedScenarioIds: [...current.completedScenarioIds, scenarioId]
  };
  saveProgress(updated);
  return updated;
};

export const setStoredLevel = (level: 'beginner' | 'intermediate'): UserProgress => {
  const current = getStoredProgress();
  const updated = { ...current, learnerLevel: level };
  saveProgress(updated);
  return updated;
};
