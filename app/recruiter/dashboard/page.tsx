'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain,
  Users,
  FileText,
  Mic,
  ArrowRight,
  Clock,
  Plus,
  Trash2,
} from 'lucide-react';
import { getAllCandidates, removeCandidate } from '@/lib/store';
import type { CandidateProfile } from '@/lib/store';
import { GlowCard } from '@/components/ui/GlowCard';

export default function RecruiterDashboardPage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [tick, setTick] = useState(0);

  // Poll the store every second so new candidates appear without a full reload
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setCandidates(getAllCandidates());
  }, [tick]);

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeCandidate(id);
    setCandidates(getAllCandidates());
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  };

  return (
    <div className="min-h-screen bg-nt-bg bg-grid relative">
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full bg-nt-purple/3 blur-3xl pointer-events-none" />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-nt-border bg-nt-bg/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-nt-cyan/10 border border-nt-cyan/30 flex items-center justify-center">
            <Brain size={13} className="text-nt-cyan" />
          </div>
          <span className="font-display text-sm font-bold text-white tracking-wider">
            NEURO<span className="text-nt-cyan">TWIN</span>
          </span>
          <div className="h-4 w-px bg-gray-800" />
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-nt-purple" />
            <span className="text-sm text-gray-400">Talent Pool</span>
          </div>
        </div>

        <Link
          href="/candidate/setup"
          className="flex items-center gap-1.5 text-xs bg-nt-cyan/8 border border-nt-cyan/25 text-nt-cyan hover:bg-nt-cyan/15 px-3 py-2 rounded-lg transition-all"
        >
          <Plus size={12} />
          Add Candidate
        </Link>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Stats bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-display font-bold text-white tracking-wide">
              Candidate <span className="text-nt-purple">Pool</span>
            </h1>
            <p className="text-gray-600 text-xs font-mono mt-0.5">
              {candidates.length} verified twin
              {candidates.length !== 1 ? 's' : ''} available
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-mono text-gray-700">Session</p>
              <p className="text-sm font-mono text-nt-cyan">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {candidates.length === 0 && (
          <GlowCard
            glowColor="purple"
            hover={false}
            className="p-16 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-nt-purple/8 border border-nt-purple/20 flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-nt-purple/60" />
            </div>
            <h3 className="text-white font-semibold mb-2">No candidates yet</h3>
            <p className="text-gray-600 text-sm mb-6 max-w-xs mx-auto">
              Candidates complete the onboarding flow and appear here as
              verified AI twins ready to interview.
            </p>
            <Link
              href="/candidate/setup"
              className="inline-flex items-center gap-2 bg-nt-cyan/10 border border-nt-cyan/30 text-nt-cyan px-5 py-2.5 rounded-xl text-sm hover:bg-nt-cyan/20 transition-all"
            >
              <Plus size={14} />
              Onboard a candidate
            </Link>
          </GlowCard>
        )}

        {/* Candidate grid */}
        {candidates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((c) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                timeAgo={timeAgo(c.uploadedAt)}
                onRemove={(e) => handleRemove(c.id, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  timeAgo,
  onRemove,
}: {
  candidate: CandidateProfile;
  timeAgo: string;
  onRemove: (e: React.MouseEvent) => void;
}) {
  const hasTranscript = candidate.verifiedTranscript?.trim().length > 0;

  return (
    <Link
      href={`/recruiter/interview/${candidate.id}`}
      className="group relative flex flex-col rounded-2xl border border-nt-border bg-nt-bg-2 hover:border-nt-purple/40 hover:shadow-glow-purple transition-all duration-300 overflow-hidden"
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-nt-purple/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-5 flex-1 flex flex-col">
        {/* Avatar + name */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-nt-purple/15 border border-nt-purple/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-display font-bold text-nt-purple">
                {candidate.candidateName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {candidate.candidateName}
              </p>
              <p className="text-gray-600 text-xs font-mono">{candidate.id}</p>
            </div>
          </div>

          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-900/30 text-gray-700 hover:text-red-400 transition-all"
            title="Remove candidate"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Source badges */}
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border bg-nt-bg-3 border-gray-800 text-gray-500">
            <FileText size={9} />
            Resume
          </span>
          {hasTranscript && (
            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border bg-nt-cyan/5 border-nt-cyan/20 text-nt-cyan">
              <Mic size={9} />
              Interview
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-nt-bg-3 border border-gray-800/60 rounded-lg p-2.5">
            <p className="text-[10px] font-mono text-gray-700 mb-0.5">
              Knowledge base
            </p>
            <p className="text-sm font-mono text-white">
              {candidate.wordCount.toLocaleString()}
            </p>
            <p className="text-[9px] text-gray-700">words</p>
          </div>
          <div className="bg-nt-bg-3 border border-gray-800/60 rounded-lg p-2.5">
            <p className="text-[10px] font-mono text-gray-700 mb-0.5">
              Transcript
            </p>
            <p className="text-sm font-mono text-white">
              {hasTranscript
                ? candidate.verifiedTranscript.split(/\s+/).length
                : 0}
            </p>
            <p className="text-[9px] text-gray-700">words</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800/60">
          <div className="flex items-center gap-1 text-[10px] font-mono text-gray-700">
            <Clock size={9} />
            {timeAgo}
          </div>
          <div className="flex items-center gap-1 text-xs text-nt-purple font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Interview Twin
            <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </Link>
  );
}
