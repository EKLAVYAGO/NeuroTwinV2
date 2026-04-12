'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { MicButton } from './MicButton';
import { LoadingPulse } from '@/components/ui/LoadingPulse';
import type { TwinMessage, MicState } from '@/types';

interface ChatPanelProps {
  messages: TwinMessage[];
  isLoading: boolean;
  micState: MicState;
  playingMessageId: string | null;
  onSendQuestion: (question: string) => void;
  onMicStart: () => void;
  onMicStop: () => void;
}

export function ChatPanel({
  messages,
  isLoading,
  micState,
  playingMessageId,
  onSendQuestion,
  onMicStart,
  onMicStop,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleTextSend = () => {
    if (!textInput.trim() || isLoading) return;
    onSendQuestion(textInput.trim());
    setTextInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-nt-cyan/5 border border-nt-cyan/10 flex items-center justify-center">
              <span className="text-nt-cyan text-lg">💬</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">
                Hold the mic button and ask the Twin a question
              </p>
              <p className="text-gray-700 text-xs mt-1 font-mono">
                All answers are grounded in verified candidate data
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isPlaying={playingMessageId === msg.id}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-nt-bg-3 border border-nt-border rounded-2xl rounded-tl-sm">
              <LoadingPulse label="Twin is formulating" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="p-4 border-t border-nt-border bg-nt-bg/80 backdrop-blur-sm">
        <div className="flex items-end gap-3">
          {/* Text input fallback */}
          <div className="flex-1 relative">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTextSend();
                }
              }}
              placeholder="Type a question or hold mic to speak…"
              rows={1}
              className="w-full bg-nt-bg-2 border border-nt-border rounded-xl px-4 py-2.5 text-sm text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-nt-cyan/40 resize-none transition-colors"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
            {textInput && (
              <button
                onClick={handleTextSend}
                disabled={isLoading}
                className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-nt-cyan/10 text-nt-cyan hover:bg-nt-cyan/20 transition-colors disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            )}
          </div>

          <MicButton state={micState} onStart={onMicStart} onStop={onMicStop} />
        </div>
      </div>
    </div>
  );
}
