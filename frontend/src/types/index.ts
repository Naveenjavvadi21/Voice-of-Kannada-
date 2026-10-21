export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  kannada_script: string;
  transliteration?: string;
  english?: string;
  correction?: string | null;
  tip?: string | null;
  suggested_replies?: SuggestedReply[];
  timestamp?: number;
}

export interface SuggestedReply {
  kannada: string;
  transliteration: string;
  english: string;
}

export interface ChatResponse {
  kannada_script: string;
  transliteration: string;
  english: string;
  correction?: string | null;
  tip?: string | null;
  suggested_replies: SuggestedReply[];
  scenario_completed: boolean;
  turn_count: number;
}

export interface WordScore {
  word: string;
  matched?: string | null;
  status: 'correct' | 'warning' | 'missing';
  phonetic_tip?: string | null;
}

export interface PronunciationResponse {
  score: number;
  verdict: string;
  words: WordScore[];
  actionable_tip: string;
  target_transliteration?: string | null;
  recognized_transliteration?: string | null;
}

export interface DialectVariant {
  region: string;
  phrase_kannada: string;
  phrase_transliteration: string;
  note: string;
}

export interface RegionalDialectItem {
  standard_phrase: string;
  standard_transliteration: string;
  english: string;
  cultural_note: string;
  variants: DialectVariant[];
}

export interface PhraseItem {
  id: string;
  category: string;
  kannada_script: string;
  transliteration: string;
  english: string;
  context_note?: string | null;
}

export interface ScenarioMission {
  id: string;
  title: string;
  kannada_title: string;
  category: string;
  icon: string;
  description: string;
  goal: string;
  target_turns: number;
  badge_name: string;
  badge_icon: string;
  partner_role: string;
  starter_message: ChatResponse;
  key_phrases: SuggestedReply[];
}

export interface UserProgress {
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  completedScenarioIds: string[];
  favoritePhraseIds: string[];
  phrasesPracticed: number;
  learnerLevel: 'beginner' | 'intermediate';
}
