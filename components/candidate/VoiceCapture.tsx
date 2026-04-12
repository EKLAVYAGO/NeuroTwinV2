'use client';

import { useEffect } from 'react';
import { Mic, MicOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { GlowCard } from '@/components/ui/GlowCard';

interface VoiceCaptureProps {
  onVerified: (transcript: string) => void;
}

const MIN_CHARS = 100;

export function VoiceCapture({ onVerified }: VoiceCaptureProps) {
  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const total = transcript + interimTranscript;
  const isReady = transcript.length >= MIN_CHARS;
  const progress = Math.min((transcript.length / MIN_CHARS) * 100, 100);

  useEffect(() => {
    if (!isSupported) return;
  }, [isSupported]);

  return (
    <div className="space-y-4">
      {/* Prompt */}
      <GlowCard glowColor="purple" className="p-4">
        <div className="flex gap-3">
          <div className="w-1 rounded-full bg-gradient-to-b from-nt-purple to-nt-cyan flex-shrink-0" />
          <div>
            <p className="text-xs font-mono text-nt-purple mb-1 uppercase tracking-widest">
              Verification Prompt
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Please verbally explain your most complex technical project.
              Describe the{' '}
              <span className="text-white font-medium">problem</span>,{' '}
              <span className="text-white font-medium">your approach</span>, the{' '}
              <span className="text-white font-medium">tech stack</span>, and
              the <span className="text-white font-medium">outcome</span>. Be
              specific.
            </p>
          </div>
        </div>
      </GlowCard>

      {/* Mic control */}
      <div className="flex flex-col items-center gap-4 py-4">
        {!isSupported && (
          <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-900/20 border border-amber-700/30 px-4 py-2 rounded-lg">
            <AlertCircle size={14} />
            Speech recognition requires Chrome. Please switch browsers.
          </div>
        )}

        <div className="relative">
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping scale-150" />
              <div
                className="absolute inset-0 rounded-full bg-red-500/10 animate-ping scale-125"
                style={{ animationDelay: '0.3s' }}
              />
            </>
          )}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
              isListening
                ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : isReady
                  ? 'bg-nt-cyan/10 border-nt-cyan text-nt-cyan shadow-glow-cyan'
                  : 'bg-nt-bg-2 border-gray-700 text-gray-500 hover:border-gray-600'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
        </div>

        <p className="text-xs font-mono text-gray-600">
          {isListening
            ? 'RECORDING — click to stop'
            : isReady
              ? 'CAPTURED — ready to continue'
              : 'Click to start recording'}
        </p>
      </div>

      {/* Transcript display */}
      {(transcript || interimTranscript) && (
        <GlowCard glowColor="cyan" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">
              Live Transcript
            </span>
            <button
              onClick={resetTranscript}
              className="text-xs text-gray-600 hover:text-gray-400"
            >
              Clear
            </button>
          </div>
          <div className="text-sm leading-relaxed max-h-36 overflow-y-auto">
            <span className="text-gray-300">{transcript}</span>
            <span className="text-gray-600 italic">{interimTranscript}</span>
          </div>
        </GlowCard>
      )}

      {/* Progress indicator */}
      {total.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-gray-600">
            <span>
              {transcript.length} / {MIN_CHARS} chars min
            </span>
            {isReady && (
              <span className="text-nt-cyan flex items-center gap-1">
                <CheckCircle size={11} /> Minimum reached
              </span>
            )}
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isReady ? 'bg-nt-cyan' : 'bg-nt-purple'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-xs text-center">{error}</p>}

      {/* Confirm button */}
      <button
        disabled={!isReady}
        onClick={() => onVerified(transcript)}
        className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 border ${
          isReady
            ? 'bg-nt-cyan/10 border-nt-cyan text-nt-cyan hover:bg-nt-cyan/20 shadow-glow-cyan'
            : 'bg-gray-800/50 border-gray-700 text-gray-600 cursor-not-allowed'
        }`}
      >
        {isReady
          ? '✓ Confirm & Create My Digital Twin'
          : `Speak for at least ${MIN_CHARS - transcript.length} more characters`}
      </button>
    </div>
  );
}
