'use client';

import { ShieldCheck, Volume2 } from 'lucide-react';
import type { TwinMessage } from '@/types';
import { formatTime } from '@/lib/utils';

interface MessageBubbleProps {
  message: TwinMessage;
  isPlaying?: boolean;
}

export function MessageBubble({ message, isPlaying }: MessageBubbleProps) {
  const isRecruiter = message.role === 'recruiter';

  return (
    <div
      className={`flex ${isRecruiter ? 'justify-end' : 'justify-start'} group`}
    >
      {!isRecruiter && (
        <div className="w-7 h-7 rounded-full bg-nt-cyan/10 border border-nt-cyan/30 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
          <span className="text-[9px] font-mono font-bold text-nt-cyan">
            NT
          </span>
        </div>
      )}

      <div
        className={`max-w-[80%] space-y-1 ${isRecruiter ? 'items-end' : 'items-start'} flex flex-col`}
      >
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isRecruiter
              ? 'bg-nt-purple/20 border border-nt-purple/30 text-gray-200 rounded-tr-sm'
              : 'bg-nt-bg-3 border border-nt-border text-gray-200 rounded-tl-sm'
          }`}
        >
          {message.content}
        </div>

        <div
          className={`flex items-center gap-2 px-1 ${isRecruiter ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <span className="text-[10px] font-mono text-gray-700">
            {formatTime(message.timestamp)}
          </span>

          {!isRecruiter && message.evidenceQuote && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-nt-cyan">
              <ShieldCheck size={10} />
              <span>evidence logged</span>
            </div>
          )}

          {isPlaying && !isRecruiter && (
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-0.5 bg-nt-cyan rounded-full"
                  style={{
                    height: `${6 + Math.random() * 8}px`,
                    animation: `audioBar 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
                  }}
                />
              ))}
              <style>{`
                @keyframes audioBar {
                  from { transform: scaleY(0.4); }
                  to { transform: scaleY(1); }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>

      {isRecruiter && (
        <div className="w-7 h-7 rounded-full bg-nt-purple/20 border border-nt-purple/40 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
          <span className="text-[9px] font-mono font-bold text-nt-purple">
            YOU
          </span>
        </div>
      )}
    </div>
  );
}
