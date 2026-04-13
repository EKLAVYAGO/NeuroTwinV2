'use client';

import { ShieldCheck, Quote, Clock } from 'lucide-react';
import type { EvidenceItem } from '@/types';
import { formatTime } from '@/lib/utils';

interface EvidenceBoardProps {
  items: EvidenceItem[];
}

export function EvidenceBoard({ items }: EvidenceBoardProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-nt-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-nt-amber" />
          <span className="text-sm font-medium text-white">Evidence Board</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${items.length > 0 ? 'bg-nt-amber animate-pulse' : 'bg-gray-700'}`}
          />
          <span className="text-xs font-mono text-gray-600">
            {items.length} {items.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>

      {/* Evidence list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
            <div className="w-10 h-10 rounded-xl bg-nt-amber/5 border border-nt-amber/15 flex items-center justify-center">
              <ShieldCheck size={18} className="text-nt-amber/40" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">No evidence yet</p>
              <p className="text-gray-700 text-xs mt-1 font-mono max-w-[180px]">
                Ask the Twin a question to see verified source material appear
                here
              </p>
            </div>
          </div>
        )}

        {items.map((item, idx) => (
          <EvidenceCard key={item.id} item={item} index={idx + 1} />
        ))}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="p-3 border-t border-nt-border">
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-700">
            <div className="w-1.5 h-1.5 rounded-full bg-nt-amber" />
            All evidence sourced from verified candidate materials
          </div>
        </div>
      )}
    </div>
  );
}

function EvidenceCard({ item, index }: { item: EvidenceItem; index: number }) {
  return (
    <div
      className="rounded-xl border border-amber-700/20 bg-amber-900/5 overflow-hidden"
      style={{
        animation: 'slideInRight 0.4s ease-out both',
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Card header */}
      <div className="px-3 py-2 border-b border-amber-700/15 flex items-center justify-between bg-amber-900/10">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-nt-amber/20 border border-nt-amber/40 flex items-center justify-center text-[9px] font-mono font-bold text-nt-amber">
            {index}
          </span>
          <span className="text-[10px] font-mono text-amber-500/80 uppercase tracking-widest">
            Verified Source
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-gray-700">
          <Clock size={9} />
          {formatTime(item.timestamp)}
        </div>
      </div>

      {/* Recruiter question */}
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-1">
          Question asked
        </p>
        <p className="text-xs text-gray-400 italic">"{item.question}"</p>
      </div>

      {/* Evidence quote */}
      <div className="px-3 pb-3 pt-2">
        <p className="text-[10px] font-mono text-amber-500/70 uppercase tracking-widest mb-1.5 flex items-center gap-1">
          <Quote size={9} />
          Source evidence
        </p>
        <blockquote className="border-l-2 border-nt-amber/50 pl-3 text-xs text-amber-100/80 leading-relaxed">
          {item.evidenceQuote}
        </blockquote>
      </div>
    </div>
  );
}
