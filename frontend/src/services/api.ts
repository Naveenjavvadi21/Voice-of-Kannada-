import type {
  ChatResponse,
  PronunciationResponse,
  ScenarioMission,
  PhraseItem,
  RegionalDialectItem,
  ChatMessage
} from '../types';

const API_BASE = '/api';

export const checkHealth = async (): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch {
    return { status: 'offline', force_offline_demo: true };
  }
};

export const sendChatMessage = async (
  text: string,
  scenarioId: string = 'free_tutor',
  level: 'beginner' | 'intermediate' = 'beginner',
  history: ChatMessage[] = [],
  _isDemoMode: boolean = false
): Promise<ChatResponse> => {
  // If demo mode is active or backend unreachable, fallback gracefully
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        scenario_id: scenarioId,
        level,
        conversation_history: history
      })
    });

    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('API call failed, using client-side offline tutor fallback:', err);
    return getClientOfflineResponse(scenarioId);
  }
};

export const evaluatePronunciation = async (
  target: string,
  recognized: string
): Promise<PronunciationResponse> => {
  try {
    const res = await fetch(`${API_BASE}/pronunciation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, recognized })
    });

    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Pronunciation API failed, using client-side scorer fallback:', err);
    // Simple client fallback scorer
    const isClose = target.toLowerCase().trim() === recognized.toLowerCase().trim();
    return {
      score: isClose ? 95 : 75,
      verdict: isClose ? 'ಅದ್ಭುತ! (Superb!) Excellent pronunciation!' : 'ಒಳ್ಳೆಯ ಪ್ರಯತ್ನ! (Good effort!) Keep practicing!',
      words: target.split(' ').map((w) => ({
        word: w,
        matched: recognized,
        status: isClose ? 'correct' : 'warning',
        phonetic_tip: isClose ? null : 'Notice vowel duration and retroflex consonants.'
      })),
      actionable_tip: 'Speak with steady rhythm and clear consonant release.'
    };
  }
};

export const fetchScenarios = async (): Promise<ScenarioMission[]> => {
  try {
    const res = await fetch(`${API_BASE}/scenarios`);
    const data = await res.json();
    return data.scenarios || [];
  } catch {
    return [];
  }
};

export const fetchPhrases = async (category?: string): Promise<{ phrases: PhraseItem[]; categories: string[] }> => {
  try {
    const url = category && category !== 'All' ? `${API_BASE}/phrases?category=${encodeURIComponent(category)}` : `${API_BASE}/phrases`;
    const res = await fetch(url);
    const data = await res.json();
    return { phrases: data.phrases || [], categories: data.categories || ['All'] };
  } catch {
    return { phrases: [], categories: ['All'] };
  }
};

export const fetchDialects = async (): Promise<RegionalDialectItem[]> => {
  try {
    const res = await fetch(`${API_BASE}/dialects`);
    const data = await res.json();
    return data.dialects || [];
  } catch {
    return [];
  }
};

// Client-side quick offline fallback if offline and backend disconnected
function getClientOfflineResponse(scenarioId: string): ChatResponse {
  if (scenarioId === 'auto_ride') {
    return {
      kannada_script: 'ಸರಿ ಸ್ವಾಮಿ, ಇಂದಿರಾನಗರಕ್ಕೆ ಬರ್ತೀನಿ. ಹತ್ತಿ, ಮೀಟರ್ ಹಾಕ್ತೀನಿ.',
      transliteration: 'Sari swami, Indiranagarakke bartheeni. Hatthi, meter haaktheeni.',
      english: 'Okay sir, I will come to Indiranagar. Please get in, I will run meter.',
      tip: 'Tip: Always address Bengaluru auto drivers respectfully as "Anna".',
      suggested_replies: [
        { kannada: 'ಎಷ್ಟು ಆಯ್ತು ಅಣ್ಣ?', transliteration: 'Eshtu aaythu anna?', english: 'How much did it cost, brother?' },
        { kannada: 'ಗೂಗಲ್ ಪೇ ಮಾಡ್ತೀನಿ', transliteration: 'Google Pay maadtini', english: 'I will pay via Google Pay' }
      ],
      scenario_completed: false,
      turn_count: 1
    };
  }

  return {
    kannada_script: 'ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಪ್ರಯತ್ನ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ. ಹೀಗೇ ಕಲಿಯುತ್ತಿರಿ!',
    transliteration: 'Namaskara! Nimma prayathna tumba chennaagide. Heege kaliyutthiri!',
    english: 'Hello! Your effort is very good. Keep learning like this!',
    tip: 'Tip: Adding "re" or "ri" at the end of sentences expresses warmth and politeness.',
    suggested_replies: [
      { kannada: 'ಧನ್ಯವಾದಗಳು ಗುರುಗಳೇ', transliteration: 'Dhanyavaadagalu gurugale', english: 'Thank you teacher' },
      { kannada: 'ನನಗೆ ಊಟದ ಬಗ್ಗೆ ಹೇಳಿಕೊಡಿ', transliteration: 'Nanage ootada bagge helikodi', english: 'Teach me about food' }
    ],
    scenario_completed: false,
    turn_count: 1
  };
}
