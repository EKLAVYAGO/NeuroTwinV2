'use client';

import { Mic, MicOff, Loader2 } from 'lucide-react';
import type { MicState } from '@/types';

interface MicButtonProps {
  state: MicState;
  onStart: () => void;
  onStop: () => void;
}

export function MicButton({ state, onStart, onStop }: MicButtonProps) {
  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-500/30 animate-[pulseRing_1.5s_cubic-bezier(0.215,0.61,0.355,1)_infinite] scale-110" />
            <div className="absolute inset-0 rounded-full bg-red-500/15 animate-[pulseRing_1.5s_cubic-bezier(0.215,0.61,0.355,1)_0.5s_infinite] scale-125" />
          </>
        )}

        <button
          onMouseDown={onStart}
          onMouseUp={onStop}
          onTouchStart={onStart}
          onTouchEnd={onStop}
          disabled={isProcessing}
          className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isRecording
              ? 'bg-red-500/20 border-red-500 text-red-400 scale-110 shadow-[0_0_25px_rgba(239,68,68,0.5)]'
              : isProcessing
                ? 'bg-nt-purple/20 border-nt-purple text-nt-purple shadow-glow-purple'
                : 'bg-nt-bg-2 border-nt-border hover:border-nt-cyan/40 hover:text-nt-cyan text-gray-500 hover:shadow-glow-cyan hover:scale-105'
          } disabled:cursor-wait`}
        >
          {isProcessing ? (
            <Loader2 size={20} className="animate-spin" />
          ) : isRecording ? (
            <MicOff size={20} />
          ) : (
            <Mic size={20} />
          )}
        </button>
      </div>

      <span className="text-[10px] font-mono tracking-widest uppercase text-gray-600">
        {isProcessing
          ? 'Processing…'
          : isRecording
            ? 'Release to send'
            : 'Hold to speak'}
      </span>
    </div>
  );
}
