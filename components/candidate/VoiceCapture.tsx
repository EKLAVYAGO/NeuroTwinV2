'use client';

import { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { GlowCard } from '@/components/ui/GlowCard';

type GlowColor = 'purple' | 'cyan' | 'amber';
const MIN_CHARS_PER_Q = 50;

export interface QuestionPrompt {
  type: string;
  title: string;
  glow: GlowColor;
  text: string;
}

interface VoiceCaptureProps {
  prompts: QuestionPrompt[];
  onVerified: (fullTranscript: string, audioData?: string) => void;
}

export function VoiceCapture({ prompts, onVerified }: VoiceCaptureProps) {
  const [qIndex, setQIndex] = useState(0);
  const [accumulated, setAccumulated] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const accumulatedRef = useRef('');

  useEffect(() => {
    accumulatedRef.current = accumulated;
  }, [accumulated]);

  useEffect(() => {
    let streamRef: MediaStream | null = null;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      streamRef = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
         const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
         const reader = new FileReader();
         reader.onloadend = () => {
           onVerified(accumulatedRef.current.trim(), reader.result as string);
         };
         reader.readAsDataURL(blob);
      };
      mr.start(2000);
    }).catch(e => console.error("Audio recording disabled", e));

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef) streamRef.getTracks().forEach(t => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const isReady = transcript.length >= MIN_CHARS_PER_Q;
  const progress = Math.min((transcript.length / MIN_CHARS_PER_Q) * 100, 100);

  useEffect(() => {
    if (!isSupported) return;
  }, [isSupported]);

  const handleNext = () => {
    const newlyAccumulated = accumulated + `\n\nQuestion ${qIndex + 1} [${prompts[qIndex].type}]: ${prompts[qIndex].text}\nAnswer: ${transcript}`;
    
    if (qIndex < prompts.length - 1) {
      setAccumulated(newlyAccumulated);
      setQIndex(qIndex + 1);
      resetTranscript();
    } else {
      accumulatedRef.current = newlyAccumulated;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
         mediaRecorderRef.current.stop();
      } else {
         onVerified(newlyAccumulated.trim());
      }
    }
  };

  const currentPrompt = prompts[qIndex];

  if (!prompts || prompts.length === 0) return <p className="text-gray-500">Loading dynamic questions...</p>;

  return (
    <div className="space-y-4 relative">
      {/* Sequence indicators */}
      <div className="flex gap-1 justify-center mb-4 flex-wrap">
        {prompts.map((p, idx) => (
          <div key={idx} className={`h-1.5 w-6 rounded-full transition-colors duration-500 flex-shrink-0 ${qIndex >= idx ? (p.glow === 'purple' ? 'bg-nt-purple' : 'bg-nt-cyan') : 'bg-gray-800'}`} />
        ))}
      </div>

      {/* Prompt */}
      <GlowCard glowColor={currentPrompt.glow} hover={false} className="p-4 transition-all duration-500">
        <div className="flex gap-3">
          <div className={`w-1 rounded-full flex-shrink-0 ${currentPrompt.glow === 'purple' ? 'bg-gradient-to-b from-nt-purple to-nt-purple/30' : 'bg-gradient-to-b from-nt-cyan to-nt-cyan/30'}`} />
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className={`text-xs font-mono uppercase tracking-widest ${currentPrompt.glow === 'purple' ? 'text-nt-purple' : 'text-nt-cyan'}`}>
                Q{qIndex + 1}/{prompts.length}: {currentPrompt.title}
              </p>
              <span className="text-[10px] text-gray-500 font-mono hidden sm:block bg-nt-bg px-2 py-0.5 rounded-full border border-gray-800">
                {currentPrompt.type}
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mt-2">
              {currentPrompt.text}
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
        <GlowCard glowColor="cyan" hover={false} className="p-4">
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
              {transcript.length} / {MIN_CHARS_PER_Q} chars min
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
        disabled={!isReady || isListening}
        onClick={handleNext}
        className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 border flex items-center justify-center gap-2 ${
          isReady && !isListening
            ? 'bg-nt-cyan/10 border-nt-cyan text-nt-cyan hover:bg-nt-cyan/20 shadow-glow-cyan'
            : 'bg-gray-800/50 border-gray-700 text-gray-600 cursor-not-allowed'
        }`}
      >
        {qIndex < prompts.length - 1 ? (
          <>Next Question <ArrowRight size={16} /></>
        ) : (
          '✓ Confirm & Create My Digital Twin'
        )}
      </button>
    </div>
  );
}
