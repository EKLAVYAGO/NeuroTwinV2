'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Brain,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Mic,
  MicOff,
  Quote,
  FileText,
  Send,
  Users,
  Loader2,
  Volume2,
  VolumeX,
  Clock,
  Home,
  Activity,
  Flag,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

import { getCandidate } from '@/lib/store';
import type { CandidateProfile } from '@/lib/store';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { generateId, formatTime } from '@/lib/utils';
import { VOICE_IDS } from '@/types';
import type {
  TwinMessage,
  EvidenceItem,
  MicState,
  TwinChatResponse,
  SourceType,
  AnalyticsResponse,
} from '@/types';

// ── Source type badge ──────────────────────────────────────────────────────
function SourceBadge({ source }: { source: SourceType }) {
  if (source === 'Resume') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-nt-bg-3 border border-gray-700 text-gray-400">
        <FileText size={9} />
        Resume
      </span>
    );
  }
  if (source === 'Live Interview') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-nt-cyan/8 border border-nt-cyan/25 text-nt-cyan">
        <Mic size={9} />
        Live Interview
      </span>
    );
  }
  return null;
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [messages, setMessages] = useState<TwinMessage[]>([]);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [micState, setMicState] = useState<MicState>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Analytics State
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics'>('chat');
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    const c = getCandidate(id);
    if (!c) router.replace('/recruiter/dashboard');
    else setCandidate(c);
  }, [id, router]);

  useEffect(() => {
    if (activeTab === 'chat') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  // Trigger Analytics fetch when tab mounts
  useEffect(() => {
    if (
      activeTab === 'analytics' &&
      !analytics &&
      !isLoadingAnalytics &&
      candidate
    ) {
      const fetchAnalytics = async () => {
        setIsLoadingAnalytics(true);
        try {
          const res = await fetch('/api/twin/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              candidateKnowledgeBase: candidate.candidateKnowledgeBase,
            }),
          });
          if (!res.ok) throw new Error('Analytics failed');
          const data = await res.json();
          setAnalytics(data);
        } catch (err: any) {
          setError(err.message || 'Failed to fetch analytics');
        } finally {
          setIsLoadingAnalytics(false);
        }
      };
      fetchAnalytics();
    }
  }, [activeTab, analytics, isLoadingAnalytics, candidate]);

  const playVoice = useCallback(
    async (text: string) => {
      if (!voiceEnabled || !window.Audio) return;
      try {
        const voiceId = VOICE_IDS[voiceGender];
        const res = await fetch('/api/twin/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voiceId }),
        });
        if (!res.ok) throw new Error('TTS proxy failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play().catch((e) => console.error('Audio playback error:', e));
      } catch (err) {
        console.warn('ElevenLabs TTS Error, falling back to native TTS:', err);
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(text);
          utt.rate = 0.95;
          // Optionally map gender to a voice type if available in browser
          window.speechSynthesis.speak(utt);
        }
      }
    },
    [voiceEnabled, voiceGender]
  );

  const sendQuestion = useCallback(
    async (question: string) => {
      if (!candidate || isLoading || !question.trim()) return;

      setIsLoading(true);
      setError(null);

      // Recruiter message
      const rMsg: TwinMessage = {
        id: generateId(),
        role: 'recruiter',
        content: question,
        timestamp: new Date(),
      };
      setMessages((p) => [...p, rMsg]);
      historyRef.current.push({ role: 'recruiter', content: question });

      try {
        const res = await fetch('/api/twin/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            candidateKnowledgeBase: candidate.candidateKnowledgeBase,
            conversationHistory: historyRef.current.slice(-8),
          }),
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);

        const data: TwinChatResponse = await res.json();

        const tMsg: TwinMessage = {
          id: generateId(),
          role: 'twin',
          content: data.answer,
          evidenceQuote: data.evidence_quote,
          sourceType: data.source_type,
          timestamp: new Date(),
        };
        setMessages((p) => [...p, tMsg]);
        historyRef.current.push({ role: 'twin', content: data.answer });

        // Add to evidence board only if there is a real quote
        if (data.evidence_quote?.trim()) {
          setEvidenceItems((p) => [
            ...p,
            {
              id: generateId(),
              question,
              evidenceQuote: data.evidence_quote,
              sourceType: data.source_type,
              timestamp: new Date(),
            },
          ]);
        }

        // ElevenLabs TTS Proxy
        if (voiceEnabled) {
          playVoice(data.answer);
        }
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to get response');
      } finally {
        setIsLoading(false);
      }
    },
    [candidate, isLoading, voiceEnabled, playVoice]
  );

  const handleMicStart = () => {
    if (isLoading) return;
    resetTranscript();
    startListening();
    setMicState('recording');
  };

  const handleMicStop = () => {
    stopListening();
    setMicState('processing');
    setTimeout(() => {
      const q = transcript.trim();
      setMicState('idle');
      if (q.length > 2) sendQuestion(q);
      resetTranscript();
    }, 350);
  };

  useEffect(() => {
    if (!isListening && micState === 'recording') setMicState('idle');
  }, [isListening, micState]);

  if (!candidate) {
    return (
      <div className="min-h-screen bg-nt-bg flex items-center justify-center">
        <Loader2 size={24} className="text-nt-cyan animate-spin" />
      </div>
    );
  }

  const radarData = analytics
    ? [
        {
          subject: 'Tech Depth',
          A: analytics.metrics.technical_depth,
          fullMark: 100,
        },
        {
          subject: 'Clarity',
          A: analytics.metrics.communication_clarity,
          fullMark: 100,
        },
        {
          subject: 'Confidence',
          A: analytics.metrics.confidence_level,
          fullMark: 100,
        },
        {
          subject: 'Adaptability',
          A: analytics.metrics.adaptability,
          fullMark: 100,
        },
      ]
    : [];

  return (
    <div className="h-screen bg-nt-bg flex flex-col overflow-hidden">
      <div className="fixed top-0 right-0 w-80 h-80 rounded-full bg-nt-purple/3 blur-3xl pointer-events-none" />

      {/* ── Header ── */}
      <header className="relative z-20 flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 border-b border-nt-border bg-nt-bg/90 backdrop-blur-sm flex-shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-gray-600 hover:text-nt-cyan text-xs transition-colors"
          >
            <Home size={13} /> Home
          </Link>
          <div className="h-4 w-px bg-gray-800" />
          <Link
            href="/recruiter/dashboard"
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-400 text-xs transition-colors"
          >
            <ArrowLeft size={13} />
            <Users size={13} />
            Pool
          </Link>
          <div className="h-4 w-px bg-gray-800" />
          <Brain size={13} className="text-nt-cyan" />
          <span className="font-display text-xs font-bold text-white tracking-wider">
            NEURO<span className="text-nt-cyan">TWIN</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Candidate identity */}
          <div className="flex items-center gap-2 bg-nt-bg-2 border border-nt-border rounded-full px-3 py-1.5">
            <div className="w-5 h-5 rounded-full bg-nt-purple/20 border border-nt-purple/40 flex items-center justify-center">
              <span className="text-[9px] font-display font-bold text-nt-purple">
                {candidate.candidateName.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-gray-300">
              {candidate.candidateName}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-nt-cyan">
              <ShieldCheck size={10} />
              Verified
            </span>
          </div>

          {/* Voice Gender Toggle */}
          <div className="flex items-center gap-1 bg-nt-bg-2 border border-nt-border rounded-lg p-0.5">
            <button
              onClick={() => setVoiceGender('male')}
              className={`px-2 py-1 text-[10px] font-mono rounded-md transition-colors ${voiceGender === 'male' ? 'bg-nt-cyan/15 text-nt-cyan' : 'text-gray-500 hover:text-gray-300'}`}
            >
              M
            </button>
            <button
              onClick={() => setVoiceGender('female')}
              className={`px-2 py-1 text-[10px] font-mono rounded-md transition-colors ${voiceGender === 'female' ? 'bg-nt-cyan/15 text-nt-cyan' : 'text-gray-500 hover:text-gray-300'}`}
            >
              F
            </button>
          </div>

          {/* Voice toggle */}
          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
            className={`p-2 rounded-lg border transition-all text-xs ${
              voiceEnabled
                ? 'bg-nt-cyan/8 border-nt-cyan/25 text-nt-cyan'
                : 'bg-nt-bg-2 border-gray-800 text-gray-600 hover:text-gray-400'
            }`}
          >
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>
      </header>

      {/* ── Error banner ── */}
      {error && (
        <div className="relative z-10 flex items-center justify-between px-5 py-2 bg-red-900/20 border-b border-red-700/30 text-red-400 text-xs flex-shrink-0">
          <span className="flex items-center gap-2">
            <AlertCircle size={12} />
            {error}
          </span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* ── Tabs Navigation ── */}
      <div className="relative z-10 px-5 border-b border-nt-border flex gap-6 bg-nt-bg flex-shrink-0">
        <button
          onClick={() => setActiveTab('chat')}
          className={`py-3 text-[10px] font-mono tracking-widest uppercase transition-colors relative ${activeTab === 'chat' ? 'text-nt-cyan' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Chat Mode
          {activeTab === 'chat' && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-nt-cyan rounded-t-full shadow-glow-cyan"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-3 text-[10px] font-mono tracking-widest uppercase transition-colors relative ${activeTab === 'analytics' ? 'text-nt-cyan' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Analytics Mode
          {activeTab === 'analytics' && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-nt-cyan rounded-t-full shadow-glow-cyan"
            />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            <motion.div
              key="chat-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col md:flex-row"
            >
              {/* ── Chat Content ── */}
              <div className="flex-1 flex flex-col min-h-0 relative z-10 grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] grid">
                {/* LEFT: Messages */}
                <div className="flex flex-col border-r border-nt-border min-h-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-nt-cyan/5 border border-nt-cyan/10 flex items-center justify-center">
                          <Brain size={20} className="text-nt-cyan/50" />
                        </div>
                        <p className="text-gray-600 text-sm">
                          Hold the mic and ask a question
                        </p>
                        <p className="text-gray-700 text-xs font-mono max-w-xs">
                          e.g. "What databases have you worked with?" or "Tell
                          me about your toughest project"
                        </p>
                      </div>
                    )}

                    {messages.map((msg) => (
                      <ChatBubble key={msg.id} message={msg} />
                    ))}

                    {isLoading && (
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-nt-cyan/10 border border-nt-cyan/25 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-[8px] font-mono font-bold text-nt-cyan">
                            NT
                          </span>
                        </div>
                        <div className="bg-nt-bg-3 border border-nt-border rounded-2xl rounded-tl-sm px-4 py-3">
                          <div className="flex items-center gap-2 text-xs text-nt-cyan/70 font-mono">
                            <Loader2 size={12} className="animate-spin" />
                            Searching knowledge base…
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input bar */}
                  <div className="p-4 border-t border-nt-border bg-nt-bg/80 backdrop-blur-sm flex-shrink-0">
                    {isListening && (
                      <div className="mb-2 text-xs font-mono text-red-400 flex items-center gap-2 px-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        {transcript || 'Listening…'}
                      </div>
                    )}
                    <div className="flex items-end gap-3">
                      {/* Text input */}
                      <div className="flex-1 relative">
                        <textarea
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (textInput.trim()) {
                                sendQuestion(textInput.trim());
                                setTextInput('');
                              }
                            }
                          }}
                          placeholder="Type a question or hold mic to speak…"
                          rows={1}
                          disabled={isLoading}
                          className="w-full bg-nt-bg-2 border border-nt-border rounded-xl px-4 py-2.5 text-sm text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-nt-cyan/35 resize-none transition-colors disabled:opacity-50"
                          style={{ minHeight: '42px', maxHeight: '120px' }}
                        />
                        {textInput.trim() && (
                          <button
                            onClick={() => {
                              sendQuestion(textInput.trim());
                              setTextInput('');
                            }}
                            disabled={isLoading}
                            className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-nt-cyan/10 text-nt-cyan hover:bg-nt-cyan/20 disabled:opacity-40 transition-colors"
                          >
                            <Send size={13} />
                          </button>
                        )}
                      </div>

                      {/* Mic button */}
                      <MicBtn
                        state={micState}
                        onStart={handleMicStart}
                        onStop={handleMicStop}
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT: Evidence board */}
                <div className="hidden lg:flex flex-col min-h-0 overflow-hidden">
                  <EvidencePanel items={evidenceItems} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analytics-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 overflow-y-auto p-6 flex flex-col items-center bg-nt-bg/50 backdrop-blur-sm"
            >
              {/* ── Analytics Content ── */}
              <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Radar Chart Section */}
                <div className="flex flex-col items-center justify-center bg-nt-bg-2 border border-nt-border rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-nt-cyan/5 rounded-full blur-3xl pointer-events-none" />

                  <h3 className="text-gray-400 font-mono text-[10px] tracking-widest uppercase mb-4 self-start">
                    Behavioral Metrics Vector
                  </h3>

                  {isLoadingAnalytics ? (
                    <div className="flex flex-col items-center justify-center h-[300px] w-full text-nt-cyan/50">
                      <Loader2 size={32} className="animate-spin mb-4" />
                      <p className="text-xs font-mono">
                        Running psychological analysis...
                      </p>
                    </div>
                  ) : analytics ? (
                    <div className="w-full h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                          cx="50%"
                          cy="50%"
                          outerRadius="75%"
                          data={radarData}
                        >
                          <PolarGrid stroke="#00f5d4" opacity={0.15} />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{
                              fill: '#a0aec0',
                              fontSize: 11,
                              fontFamily: 'monospace',
                            }}
                          />
                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                          />
                          <Radar
                            name="Candidate"
                            dataKey="A"
                            stroke="#00f5d4"
                            strokeWidth={2}
                            fill="#00f5d4"
                            fillOpacity={0.25}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] w-full text-gray-600">
                      <p className="text-sm">Unable to load analytics.</p>
                    </div>
                  )}
                </div>

                {/* Info Cards Section */}
                <div className="flex flex-col gap-4">
                  {/* Archetype Card */}
                  <div className="bg-nt-bg-2 border border-nt-border rounded-2xl p-6 flex items-start gap-4 hover:border-nt-cyan/40 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-nt-cyan/10 border border-nt-cyan/20 flex items-center justify-center flex-shrink-0 text-nt-cyan">
                      <Brain size={18} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono uppercase text-gray-500 tracking-widest mb-1.5">
                        Personality Archetype
                      </h4>
                      {isLoadingAnalytics ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-nt-cyan animate-ping inline-block" />
                      ) : (
                        <p className="text-white font-display text-xl">
                          {analytics?.personality_archetype || '--'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Key Strength Card */}
                  <div className="bg-nt-bg-2 border border-nt-border rounded-2xl p-6 flex items-start gap-4 hover:border-emerald-500/40 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                      <Zap size={18} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono uppercase text-gray-500 tracking-widest mb-1.5">
                        Key Strength
                      </h4>
                      {isLoadingAnalytics ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                      ) : (
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {analytics?.key_strength || '--'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Red Flag Card */}
                  <div className="bg-nt-bg-2 border border-red-900/30 rounded-2xl p-6 flex items-start gap-4 hover:border-red-500/40 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 text-red-500">
                      <Flag size={18} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono uppercase text-red-500/60 tracking-widest mb-1.5">
                        Red Flag / Warning
                      </h4>
                      {isLoadingAnalytics ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                      ) : (
                        <p className="text-red-200/80 text-sm leading-relaxed">
                          {analytics?.red_flag_warning || '--'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Chat bubble ─────────────────────────────────────────────────────────────
function ChatBubble({ message }: { message: TwinMessage }) {
  const isRecruiter = message.role === 'recruiter';
  return (
    <div className={`flex ${isRecruiter ? 'justify-end' : 'justify-start'}`}>
      {!isRecruiter && (
        <div className="w-6 h-6 rounded-full bg-nt-cyan/10 border border-nt-cyan/25 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
          <span className="text-[8px] font-mono font-bold text-nt-cyan">
            NT
          </span>
        </div>
      )}
      <div
        className={`max-w-[82%] flex flex-col ${isRecruiter ? 'items-end' : 'items-start'} gap-1`}
      >
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isRecruiter
              ? 'bg-nt-purple/18 border border-nt-purple/25 text-gray-200 rounded-tr-sm'
              : 'bg-nt-bg-3 border border-nt-border text-gray-200 rounded-tl-sm'
          }`}
        >
          {message.content}
        </div>
        <div
          className={`flex items-center gap-2 px-1 ${isRecruiter ? 'flex-row-reverse' : ''}`}
        >
          <span className="text-[10px] font-mono text-gray-700">
            {formatTime(message.timestamp)}
          </span>
          {!isRecruiter &&
            message.sourceType &&
            message.sourceType !== 'Unknown' && (
              <SourceBadge source={message.sourceType} />
            )}
        </div>
      </div>
      {isRecruiter && (
        <div className="w-6 h-6 rounded-full bg-nt-purple/20 border border-nt-purple/35 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
          <span className="text-[8px] font-mono font-bold text-nt-purple">
            YOU
          </span>
        </div>
      )}
    </div>
  );
}

// ── Evidence panel ──────────────────────────────────────────────────────────
function EvidencePanel({ items }: { items: EvidenceItem[] }) {
  return (
    <div className="flex flex-col h-full border-l border-nt-border bg-nt-bg-2/50">
      <div className="p-4 border-b border-nt-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-nt-amber" />
          <span className="text-sm font-medium text-white">Evidence</span>
        </div>
        <span
          className={`w-2 h-2 rounded-full transition-colors ${items.length > 0 ? 'bg-nt-amber animate-pulse' : 'bg-gray-800'}`}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-12 text-center">
            <ShieldCheck size={20} className="text-gray-800" />
            <p className="text-gray-700 text-xs font-mono max-w-[180px]">
              Cited evidence will appear here as the Twin answers questions
            </p>
          </div>
        )}

        {items.map((item, idx) => (
          <EvidenceCard key={item.id} item={item} index={idx + 1} />
        ))}
      </div>

      {items.length > 0 && (
        <div className="p-3 border-t border-nt-border flex-shrink-0">
          <p className="text-[10px] font-mono text-gray-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-nt-amber" />
            All quotes are verbatim from verified materials
          </p>
        </div>
      )}
    </div>
  );
}

// ── Evidence card ───────────────────────────────────────────────────────────
function EvidenceCard({ item, index }: { item: EvidenceItem; index: number }) {
  return (
    <div
      className="rounded-xl border border-amber-800/25 bg-amber-950/15 overflow-hidden"
      style={{ animation: 'slideIn 0.35s ease-out both' }}
    >
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}`}</style>

      {/* Card header */}
      <div className="flex items-center justify-between px-3 py-2 bg-amber-900/15 border-b border-amber-800/20">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-nt-amber/15 border border-nt-amber/35 flex items-center justify-center text-[9px] font-mono font-bold text-nt-amber">
            {index}
          </span>
          <SourceBadge source={item.sourceType} />
        </div>
        <span className="text-[9px] font-mono text-gray-700 flex items-center gap-1">
          <Clock size={8} />
          {formatTime(item.timestamp)}
        </span>
      </div>

      {/* Question */}
      <div className="px-3 pt-2.5 pb-1.5">
        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-1">
          Question
        </p>
        <p className="text-xs text-gray-400 italic leading-relaxed">
          "{item.question}"
        </p>
      </div>

      {/* Evidence quote */}
      <div className="px-3 pb-3 pt-1.5">
        <p className="text-[10px] font-mono text-amber-600/70 uppercase tracking-widest mb-1.5 flex items-center gap-1">
          <Quote size={9} />
          Verbatim from knowledge base
        </p>
        <blockquote className="border-l-2 border-nt-amber/50 pl-3">
          <p className="text-xs text-amber-100/75 leading-relaxed">
            {item.evidenceQuote}
          </p>
        </blockquote>
      </div>
    </div>
  );
}

// ── Mic button ──────────────────────────────────────────────────────────────
function MicBtn({
  state,
  onStart,
  onStop,
}: {
  state: MicState;
  onStart: () => void;
  onStop: () => void;
}) {
  const isRec = state === 'recording';
  const isProc = state === 'processing';
  return (
    <div className="relative flex-shrink-0">
      {isRec && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-500/25 animate-[pulseRing_1.5s_cubic-bezier(0.215,0.61,0.355,1)_infinite] scale-110" />
          <span className="absolute inset-0 rounded-full bg-red-500/12 animate-[pulseRing_1.5s_cubic-bezier(0.215,0.61,0.355,1)_0.4s_infinite] scale-125" />
        </>
      )}
      <button
        onMouseDown={onStart}
        onMouseUp={onStop}
        onTouchStart={onStart}
        onTouchEnd={onStop}
        disabled={isProc}
        className={`relative w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          isRec
            ? 'bg-red-500/18 border-red-500 text-red-400 scale-110 shadow-[0_0_18px_rgba(239,68,68,0.45)]'
            : isProc
              ? 'bg-nt-purple/15 border-nt-purple text-nt-purple shadow-glow-purple'
              : 'bg-nt-bg-2 border-nt-border hover:border-nt-cyan/40 hover:text-nt-cyan text-gray-600 hover:shadow-glow-cyan hover:scale-105'
        } disabled:cursor-wait`}
      >
        {isProc ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isRec ? (
          <MicOff size={16} />
        ) : (
          <Mic size={16} />
        )}
      </button>
    </div>
  );
}
