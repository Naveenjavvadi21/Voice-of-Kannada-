import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import type { ChatMessage, SuggestedReply } from '../types';
import { sendChatMessage } from '../services/api';
import { speechRecognitionService } from '../services/speechRecognition';
import { speechService } from '../services/speechSynthesis';
import { addXP } from '../services/storage';
import { MicButton } from '../components/MicButton';
import { WordTappable } from '../components/WordTappable';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { TypeInputFallback } from '../components/TypeInputFallback';

interface VoiceTutorViewProps {
  isDemoMode: boolean;
  learnerLevel: 'beginner' | 'intermediate';
  onXPAdded: () => void;
}

export const VoiceTutorView: React.FC<VoiceTutorViewProps> = ({
  isDemoMode,
  learnerLevel,
  onXPAdded,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      kannada_script: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕನ್ನಡ ಶಿಕ್ಷಕ. ಇಂದು ನೀವು ಏನು ಕಲಿಯಲು ಇಷ್ಟಪಡುತ್ತೀರಿ?',
      transliteration: 'Namaskara! Naanu nimma kannada shikshaka. Indu neevu enu kaliyalu ishtapaduttheeri?',
      english: 'Hello! I am your Kannada tutor. What would you like to learn today?',
      tip: 'Tip: Tap any Kannada word to hear its pronunciation and learn its meaning!',
      suggested_replies: [
        {
          kannada: 'ನನಗೆ ಕಾಫಿ ಮತ್ತು ತಿಂಡಿ ಬಗ್ಗೆ ಹೇಳಿಕೊಡಿ',
          transliteration: 'Nanage coffee matthu thindi bagge helikodi',
          english: 'Teach me about coffee and breakfast'
        },
        {
          kannada: 'ಇಲ್ಲಿ ಹತ್ತಿರ ಮೆಟ್ರೋ ಎಲ್ಲಿದೆ?',
          transliteration: 'Illi hattira metro ellide?',
          english: 'Where is the metro nearby?'
        },
        {
          kannada: 'ನಾನು ಹೊಸದಾಗಿ ಬೆಂಗಳೂರಿಗೆ ಬಂದಿದ್ದೇನೆ',
          transliteration: 'Naanu hosadaagi Bengaloorige bandiddene',
          english: 'I recently came to Bengaluru'
        }
      ]
    }
  ]);

  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentTranscript]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setErrorMessage(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      kannada_script: text,
      english: 'User speech'
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentTranscript('');

    try {
      const response = await sendChatMessage(
        text,
        'free_tutor',
        learnerLevel,
        messages,
        isDemoMode
      );

      const assistantMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        kannada_script: response.kannada_script,
        transliteration: response.transliteration,
        english: response.english,
        correction: response.correction,
        tip: response.tip,
        suggested_replies: response.suggested_replies
      };

      setMessages((prev) => [...prev, assistantMessage]);
      addXP(25);
      onXPAdded();

      // Automatically speak the tutor reply aloud in Kannada!
      speechService.speak(response.kannada_script, { rate: 0.88 });
    } catch {
      setErrorMessage('Could not connect to tutor. Offline Demo response will be used.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      speechRecognitionService.stopListening();
      if (currentTranscript.trim()) {
        handleSendMessage(currentTranscript.trim());
      }
    } else {
      setErrorMessage(null);
      setCurrentTranscript('');
      speechRecognitionService.startListening({
        onResult: (transcript, isFinal) => {
          setCurrentTranscript(transcript);
          if (isFinal && transcript.trim()) {
            handleSendMessage(transcript.trim());
          }
        },
        onError: (err, isPermissionDenied) => {
          setErrorMessage(err);
          if (isPermissionDenied) {
            setIsTypeOpen(true);
          }
        },
        onStateChange: (state) => {
          setIsListening(state);
        }
      });
    }
  };

  const handleQuickReply = (reply: SuggestedReply) => {
    handleSendMessage(reply.kannada);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-4 py-4 pb-28">
      {/* Intro banner */}
      <div className="bg-gradient-to-r from-amber-500/15 to-red-600/10 border border-amber-300/40 rounded-2xl p-3 mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="text-xl">🎙️</span>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Spoken Kannada Practice (ಧ್ವನಿ ಅಭ್ಯಾಸ)</h2>
            <p className="text-xs text-slate-600">
              Speak naturally in Kannada. Your tutor will respond aloud with transliteration and tips.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages([messages[0]]);
          }}
          className="text-xs text-slate-500 hover:text-red-900 flex items-center gap-1 font-semibold p-1"
          title="Restart conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-4 mb-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id || index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-3xl p-4 shadow-sm border ${
                  isUser
                    ? 'bg-[#9B111E] text-white border-red-800 rounded-br-xs'
                    : 'bg-white text-slate-900 border-amber-200/70 rounded-bl-xs shadow-amber-900/5'
                }`}
              >
                {/* Speaker Header */}
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/10 text-xs">
                  <span className={`font-bold flex items-center gap-1.5 ${isUser ? 'text-amber-300' : 'text-red-900'}`}>
                    <span>{isUser ? '🧑‍🎓 You (ನೀವು)' : '👩‍🏫 Kannada Tutor (ಶಿಕ್ಷಕ)'}</span>
                  </span>
                  {!isUser && (
                    <button
                      onClick={() => speechService.speak(msg.kannada_script, { rate: 0.85 })}
                      className="text-red-800 hover:text-red-950 p-1 rounded-full hover:bg-amber-100/50 flex items-center gap-1 transition"
                      title="Listen aloud in Kannada"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="text-[11px] font-semibold">Speak</span>
                    </button>
                  )}
                </div>

                {/* Kannada Script (Word Tappable for Tutor replies) */}
                <div className={`text-base sm:text-lg font-bold leading-relaxed ${isUser ? 'text-white' : 'text-slate-900'}`}>
                  {isUser ? (
                    <span>{msg.kannada_script}</span>
                  ) : (
                    <WordTappable kannadaText={msg.kannada_script} />
                  )}
                </div>

                {/* Transliteration */}
                {msg.transliteration && (
                  <div className={`text-xs italic mt-1.5 font-medium ${isUser ? 'text-amber-200/90' : 'text-amber-900'}`}>
                    {msg.transliteration}
                  </div>
                )}

                {/* English Translation */}
                {msg.english && (
                  <div className={`text-xs mt-1 leading-normal ${isUser ? 'text-white/80' : 'text-slate-600'}`}>
                    {msg.english}
                  </div>
                )}

                {/* Gentle Correction (if user made a mistake) */}
                {msg.correction && (
                  <div className="mt-2.5 p-2 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Gentle refinement: </span>
                      <span>{msg.correction}</span>
                    </div>
                  </div>
                )}

                {/* Tutor Cultural/Grammar Tip */}
                {msg.tip && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Cultural Tip: </span>
                      <span>{msg.tip}</span>
                    </div>
                  </div>
                )}

                {/* Suggested Quick Replies for next turn */}
                {msg.suggested_replies && msg.suggested_replies.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      Suggested ways to respond:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggested_replies.map((reply, rIdx) => (
                        <button
                          key={rIdx}
                          onClick={() => handleQuickReply(reply)}
                          className="text-left text-xs bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 px-2.5 py-1.5 rounded-xl transition active:scale-95 group"
                        >
                          <div className="font-bold group-hover:text-red-900">{reply.kannada}</div>
                          <div className="text-[10px] text-slate-500 italic">{reply.transliteration}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Speaking / Listening Bubble */}
        {isListening && currentTranscript && (
          <div className="flex justify-end animate-fade-in">
            <div className="bg-red-800/80 text-amber-200 max-w-[85%] rounded-3xl p-3.5 shadow-md border border-red-700">
              <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                <span>Hearing your speech...</span>
              </div>
              <div className="text-base font-bold text-white">{currentTranscript}</div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 p-2">
            <div className="w-4 h-4 border-2 border-red-800 border-t-transparent rounded-full animate-spin" />
            <span>Tutor is formulating response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error / Alert banner */}
      {errorMessage && (
        <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold underline ml-2">Dismiss</button>
        </div>
      )}

      {/* Fixed Bottom Voice & Input Dock */}
      <div className="sticky bottom-16 bg-[#FBF9F5]/90 backdrop-blur-md pt-3 pb-1 border-t border-slate-200/60">
        <AudioVisualizer isActive={isListening} color="#9B111E" label="Listening to your Kannada..." />

        {/* Primary Mic Button */}
        <div className="flex items-center justify-center my-1">
          <MicButton
            isListening={isListening}
            onToggle={handleMicToggle}
            disabled={isLoading}
            helperText={isListening ? 'Listening... tap again to send' : 'Tap to speak Kannada to your tutor'}
          />
        </div>

        {/* Type instead Fallback */}
        <div className="mt-2">
          <TypeInputFallback
            onSend={handleSendMessage}
            isLoading={isLoading}
            isOpen={isTypeOpen}
            onToggle={() => setIsTypeOpen(!isTypeOpen)}
          />
        </div>
      </div>
    </div>
  );
};
