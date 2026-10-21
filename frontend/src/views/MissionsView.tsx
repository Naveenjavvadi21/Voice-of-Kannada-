import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Car, Coffee, ShoppingBag, Compass, HeartPulse, UserCheck,
  Award, ArrowLeft, Volume2, CheckCircle2, Sparkles, BookOpen
} from 'lucide-react';
import type { ScenarioMission, ChatMessage } from '../types';
import { fetchScenarios, sendChatMessage } from '../services/api';
import { speechRecognitionService } from '../services/speechRecognition';
import { speechService } from '../services/speechSynthesis';
import { markScenarioComplete } from '../services/storage';
import { MicButton } from '../components/MicButton';
import { WordTappable } from '../components/WordTappable';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { TypeInputFallback } from '../components/TypeInputFallback';

interface MissionsViewProps {
  isDemoMode: boolean;
  learnerLevel: 'beginner' | 'intermediate';
  completedScenarioIds: string[];
  onMissionCompleted: (scenarioId: string) => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  isDemoMode,
  learnerLevel,
  completedScenarioIds,
  onMissionCompleted,
}) => {
  const [scenarios, setScenarios] = useState<ScenarioMission[]>([]);
  const [activeScenario, setActiveScenario] = useState<ScenarioMission | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [turnsCount, setTurnsCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchScenarios();
      setScenarios(data);
    };
    load();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscript]);

  const startMission = (scenario: ScenarioMission) => {
    setActiveScenario(scenario);
    setIsCompleted(completedScenarioIds.includes(scenario.id));
    setTurnsCount(0);

    const starter: ChatMessage = {
      id: 'starter',
      role: 'assistant',
      kannada_script: scenario.starter_message.kannada_script,
      transliteration: scenario.starter_message.transliteration,
      english: scenario.starter_message.english,
      tip: scenario.starter_message.tip,
      suggested_replies: scenario.starter_message.suggested_replies
    };

    setMessages([starter]);
    speechService.speak(starter.kannada_script, { rate: 0.88 });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !activeScenario) return;

    setIsLoading(true);
    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      kannada_script: text
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentTranscript('');
    const newTurn = turnsCount + 1;
    setTurnsCount(newTurn);

    try {
      const response = await sendChatMessage(
        text,
        activeScenario.id,
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
      speechService.speak(response.kannada_script, { rate: 0.88 });

      // Check for mission completion (by turn limit or response flag)
      if (response.scenario_completed || newTurn >= activeScenario.target_turns) {
        triggerMissionWin(activeScenario.id);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const triggerMissionWin = (scenarioId: string) => {
    setIsCompleted(true);
    markScenarioComplete(scenarioId);
    onMissionCompleted(scenarioId);

    // Confetti celebration!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      speechRecognitionService.stopListening();
      if (currentTranscript.trim()) {
        handleSendMessage(currentTranscript.trim());
      }
    } else {
      setCurrentTranscript('');
      speechRecognitionService.startListening({
        onResult: (transcript, isFinal) => {
          setCurrentTranscript(transcript);
          if (isFinal && transcript.trim()) {
            handleSendMessage(transcript.trim());
          }
        },
        onError: () => {},
        onStateChange: (state) => setIsListening(state)
      });
    }
  };

  const getScenarioIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car': return <Car className="w-6 h-6 text-amber-500" />;
      case 'Coffee': return <Coffee className="w-6 h-6 text-amber-600" />;
      case 'ShoppingBag': return <ShoppingBag className="w-6 h-6 text-emerald-600" />;
      case 'Compass': return <Compass className="w-6 h-6 text-blue-500" />;
      case 'HeartPulse': return <HeartPulse className="w-6 h-6 text-rose-500" />;
      case 'UserCheck': return <UserCheck className="w-6 h-6 text-purple-500" />;
      default: return <Award className="w-6 h-6 text-amber-500" />;
    }
  };

  // If no scenario is selected, show Mission Selection Hub
  if (!activeScenario) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4 pb-28">
        <div className="mb-5 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-red-900 bg-red-100 px-3 py-1 rounded-full">
            Role-play Scenarios (ಪಾತ್ರಾಭಿನಯ)
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            Real-Life Kannada Missions
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Step into realistic Karnataka situations. Practice 3-5 turns with your AI partner to earn cultural badges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((sc) => {
            const hasCompleted = completedScenarioIds.includes(sc.id);
            return (
              <div
                key={sc.id}
                onClick={() => startMission(sc)}
                className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-200 hover:shadow-lg active:scale-98 relative overflow-hidden bg-white ${
                  hasCompleted ? 'border-emerald-300 ring-2 ring-emerald-400/20' : 'border-amber-200/80 hover:border-amber-400'
                }`}
              >
                {/* Completed Stamp */}
                {hasCompleted && (
                  <div className="absolute top-3 right-3 flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    {getScenarioIcon(sc.icon)}
                  </div>

                  <div className="flex-1 pr-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-red-900">{sc.kannada_title}</span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] uppercase font-semibold text-slate-500">{sc.category}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-red-900 transition mt-0.5">
                      {sc.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {sc.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-1.5 text-amber-800 font-semibold">
                        <span>{sc.badge_icon}</span>
                        <span>{sc.badge_name}</span>
                      </div>
                      <span className="text-slate-400 font-medium">{sc.target_turns} turns</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Role-Play Mission View
  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-4 py-3 pb-28">
      {/* Scenario Top Bar */}
      <div className="bg-white border border-amber-200 rounded-2xl p-3 shadow-xs mb-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setActiveScenario(null)}
            className="flex items-center space-x-1 text-xs font-bold text-red-900 hover:text-red-950 p-1 rounded-lg hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Missions</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              className="flex items-center space-x-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Key Phrases</span>
            </button>
            <span className="text-xs font-bold text-slate-600">
              Turn {turnsCount}/{activeScenario.target_turns}
            </span>
          </div>
        </div>

        {/* Goal Banner */}
        <div className="flex items-center space-x-2 text-xs bg-amber-50/70 p-2 rounded-xl text-amber-950">
          <span className="font-bold shrink-0">🎯 Goal:</span>
          <span>{activeScenario.goal}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="bg-gradient-to-r from-amber-400 to-red-600 h-full transition-all duration-500"
            style={{ width: `${Math.min(100, (turnsCount / activeScenario.target_turns) * 100)}%` }}
          />
        </div>
      </div>

      {/* Cheatsheet Modal/Drawer */}
      {showCheatSheet && (
        <div className="mb-3 bg-amber-50/90 border border-amber-300 rounded-2xl p-3 text-xs text-amber-950 animate-fade-in">
          <div className="flex items-center justify-between font-bold mb-1.5 text-red-900">
            <span>Cheat Sheet: Helpful Phrases for this Mission</span>
            <button onClick={() => setShowCheatSheet(false)} className="text-slate-400 hover:text-slate-700">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {activeScenario.key_phrases.map((kp, idx) => (
              <div
                key={idx}
                onClick={() => handleSendMessage(kp.kannada)}
                className="bg-white p-2 rounded-xl border border-amber-200 cursor-pointer hover:border-red-600 transition"
              >
                <div className="font-bold text-slate-900">{kp.kannada}</div>
                <div className="text-[10px] text-slate-500 italic">{kp.transliteration}</div>
                <div className="text-[11px] text-red-800">{kp.english}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mission Completed Celebration Card */}
      {isCompleted && (
        <div className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-4 shadow-lg text-center animate-bounce-short">
          <div className="text-3xl mb-1">{activeScenario.badge_icon}</div>
          <h3 className="font-extrabold text-base">Mission Accomplished!</h3>
          <p className="text-xs text-emerald-100 mt-0.5">
            You unlocked the <span className="font-bold text-white">"{activeScenario.badge_name}"</span> Badge & +150 XP!
          </p>
        </div>
      )}

      {/* Conversation Thread */}
      <div className="flex-1 space-y-4 mb-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id || index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-3xl p-4 shadow-sm border ${
                  isUser
                    ? 'bg-[#9B111E] text-white border-red-800 rounded-br-xs'
                    : 'bg-white text-slate-900 border-amber-200/80 rounded-bl-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/10 text-xs">
                  <span className={`font-bold ${isUser ? 'text-amber-300' : 'text-red-900'}`}>
                    {isUser ? '🧑‍🎓 You' : `🎭 ${activeScenario.partner_role}`}
                  </span>
                  {!isUser && (
                    <button
                      onClick={() => speechService.speak(msg.kannada_script, { rate: 0.85 })}
                      className="text-red-800 hover:text-red-950 p-1 flex items-center gap-1 font-semibold"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Hear</span>
                    </button>
                  )}
                </div>

                <div className="text-base sm:text-lg font-bold leading-relaxed">
                  {isUser ? msg.kannada_script : <WordTappable kannadaText={msg.kannada_script} />}
                </div>

                {msg.transliteration && (
                  <div className={`text-xs italic mt-1 font-medium ${isUser ? 'text-amber-200' : 'text-amber-900'}`}>
                    {msg.transliteration}
                  </div>
                )}

                {msg.english && (
                  <div className={`text-xs mt-1 ${isUser ? 'text-white/80' : 'text-slate-600'}`}>
                    {msg.english}
                  </div>
                )}

                {msg.tip && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{msg.tip}</span>
                  </div>
                )}

                {msg.suggested_replies && msg.suggested_replies.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {msg.suggested_replies.map((reply, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => handleSendMessage(reply.kannada)}
                        className="text-left text-xs bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300/80 px-2.5 py-1.5 rounded-xl transition active:scale-95"
                      >
                        <div className="font-bold">{reply.kannada}</div>
                        <div className="text-[10px] text-slate-500 italic">{reply.transliteration}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isListening && currentTranscript && (
          <div className="flex justify-end animate-fade-in">
            <div className="bg-red-800 text-white max-w-[85%] rounded-3xl p-3 shadow border border-red-700">
              <span className="text-[10px] uppercase font-bold text-amber-300 block mb-0.5">Hearing speech...</span>
              <div className="font-bold text-base">{currentTranscript}</div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 p-2">
            <div className="w-4 h-4 border-2 border-red-800 border-t-transparent rounded-full animate-spin" />
            <span>Partner is replying...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Docked Mic / Inputs */}
      <div className="sticky bottom-16 bg-[#FBF9F5]/90 backdrop-blur-md pt-3 pb-1 border-t border-slate-200/60">
        <AudioVisualizer isActive={isListening} color="#9B111E" label="Speaking to partner..." />

        <div className="flex items-center justify-center my-1">
          <MicButton
            isListening={isListening}
            onToggle={handleMicToggle}
            disabled={isLoading}
            helperText={isListening ? 'Listening... tap again to send' : `Speak to ${activeScenario.partner_role}`}
          />
        </div>

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
