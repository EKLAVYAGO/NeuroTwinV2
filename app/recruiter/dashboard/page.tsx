'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain, Users, FileText, Mic, ArrowRight, Clock, Plus, Trash2,
  Shield, Zap, Scale, X, Activity
} from 'lucide-react';
import { getAllCandidates, removeCandidate } from '@/lib/store';
import type { CandidateProfile } from '@/lib/store';
import { GlowCard } from '@/components/ui/GlowCard';

export default function RecruiterDashboardPage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [tick, setTick] = useState(0);

  // Phase 3 States
  const [biasShield, setBiasShield] = useState(false);
  const [jdText, setJdText] = useState('');
  const [isRanking, setIsRanking] = useState(false);
  const [jdScores, setJdScores] = useState<Record<string, number>>({});
  const [selectedToCompare, setSelectedToCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

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

  const handleRank = async () => {
    if (!jdText.trim() || candidates.length === 0) return;
    setIsRanking(true);
    try {
      const res = await fetch('/api/twin/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd: jdText, candidates })
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const scoreMap: Record<string, number> = {};
        data.forEach(item => { scoreMap[item.id] = item.score; });
        setJdScores(scoreMap);
      }
    } catch (e) {
      console.error(e);
    }
    setIsRanking(false);
  };

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedToCompare(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    const scoreA = jdScores[a.id] || 0;
    const scoreB = jdScores[b.id] || 0;
    return scoreB - scoreA;
  });

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  };

  const hoursSaved = candidates.length * 2.5;
  const capitalSaved = hoursSaved * 45;

  return (
    <div className="min-h-screen bg-nt-bg bg-grid relative pb-20">
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

      {/* ROI Bar */}
      <div className="bg-nt-bg-2 border-b border-nt-border py-2 px-6 flex justify-center items-center gap-8 relative z-10 shadow-[0_0_15px_rgba(168,85,247,0.05)]">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-nt-cyan" />
          <span className="text-xs font-mono text-gray-500">SYSTEM IMPACT</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-display text-white">{hoursSaved}</span>
          <span className="text-xs text-gray-500">Human Hours Saved</span>
        </div>
        <div className="h-3 w-px bg-gray-800" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-display text-green-400">${capitalSaved.toLocaleString()}</span>
          <span className="text-xs text-gray-500">Capital Reclaimed</span>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Layout framing dashboard modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-display font-bold text-white tracking-wide">
                  Candidate <span className="text-nt-purple">Pool</span>
                </h1>
                <p className="text-gray-600 text-xs font-mono mt-0.5">
                  {candidates.length} verified twin
                  {candidates.length !== 1 ? 's' : ''} available
                </p>
              </div>

              {/* Compare Trigger */}
              {selectedToCompare.length === 2 && (
                <button
                  onClick={() => setShowCompare(true)}
                  className="animate-pulse bg-nt-purple/20 border border-nt-purple text-nt-purple px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all hover:bg-nt-purple/30"
                >
                  <Scale size={14} /> Compare {selectedToCompare.length} Twins
                </button>
              )}
            </div>

            {/* Candidate grid */}
            {candidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedCandidates.map((c) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    timeAgo={timeAgo(c.uploadedAt)}
                    biasShield={biasShield}
                    jdScore={jdScores[c.id]}
                    isCompare={selectedToCompare.includes(c.id)}
                    onToggleCompare={(e) => toggleCompare(c.id, e)}
                    onRemove={(e) => handleRemove(c.id, e)}
                  />
                ))}
              </div>
            ) : (
              <GlowCard glowColor="purple" hover={false} className="p-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-nt-purple/8 border border-nt-purple/20 flex items-center justify-center mx-auto mb-4">
                  <Users size={24} className="text-nt-purple/60" />
                </div>
                <h3 className="text-white font-semibold mb-2">No candidates yet</h3>
                <p className="text-gray-600 text-sm mb-6 max-w-xs mx-auto">
                  Candidates complete the onboarding flow and appear here as verified AI twins ready to interview.
                </p>
              </GlowCard>
            )}
          </div>

          {/* Tools Side Panel */}
          <div className="space-y-6">
            <GlowCard glowColor="amber" hover={false} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield size={16} className={biasShield ? 'text-amber-400' : 'text-gray-500'} />
                  <h3 className="font-semibold text-white text-sm">Bias Shield</h3>
                </div>
                <button
                  onClick={() => setBiasShield(!biasShield)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${biasShield ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-gray-800 border border-gray-700'}`}
                >
                  <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all ${biasShield ? 'bg-amber-400 left-5' : 'bg-gray-500 left-1'}`} />
                </button>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                When active, candidate names, identities, and visual avatars are strongly masked across the system to ensure objective skill-based evaluation.
              </p>
            </GlowCard>

            <GlowCard glowColor="cyan" hover={false} className="p-5 flex flex-col h-[280px]">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-nt-cyan" />
                <h3 className="font-semibold text-white text-sm">JD Auto-Match Engine</h3>
              </div>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste Job Description here..."
                className="w-full flex-1 bg-nt-bg-3 border border-gray-800 rounded-lg p-3 text-xs text-gray-300 resize-none focus:outline-none focus:border-nt-cyan/50 transition-colors mb-3"
              />
              <button
                onClick={handleRank}
                disabled={isRanking || !jdText.trim()}
                className="w-full py-2.5 bg-nt-cyan/10 border border-nt-cyan/30 text-nt-cyan rounded-lg text-xs font-semibold hover:bg-nt-cyan/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRanking ? 'Analyzing Pool...' : 'Rank Candidates'}
              </button>
            </GlowCard>
          </div>

        </div>
      </div>

      {/* Compare Modal */}
      {showCompare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-nt-bg/80 backdrop-blur-md">
          <GlowCard glowColor="purple" hover={false} className="max-w-4xl w-full p-8 relative bg-nt-bg border-nt-purple/30">
            <button onClick={() => setShowCompare(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-display text-white mb-6 flex items-center gap-2">
              <Scale className="text-nt-purple" /> Twin Comparison Matrix
            </h2>
            <div className="flex justify-center gap-12 p-8 border border-gray-800 rounded-2xl bg-nt-bg-2">
              <p className="text-gray-500 text-sm">Comparison visualizer connecting to micro twin analytics pipeline...</p>
              {/* Note: Full Radar integration will be injected in the micro view iteration */}
            </div>
          </GlowCard>
        </div>
      )}
    </div>
  );
}

function CandidateCard({
  candidate,
  timeAgo,
  biasShield,
  jdScore,
  isCompare,
  onToggleCompare,
  onRemove,
}: {
  candidate: CandidateProfile;
  timeAgo: string;
  biasShield: boolean;
  jdScore?: number;
  isCompare: boolean;
  onToggleCompare: (e: React.MouseEvent) => void;
  onRemove: (e: React.MouseEvent) => void;
}) {
  const hasTranscript = candidate.fullTranscript?.trim().length > 0;
  const displayName = biasShield 
    ? `Candidate [${candidate.id.split('-').pop()}]` 
    : candidate.candidateName;

  return (
    <Link
      href={`/recruiter/interview/${candidate.id}`}
      className="group relative flex flex-col rounded-2xl border border-nt-border bg-nt-bg-2 hover:border-nt-purple/40 hover:shadow-glow-purple transition-all duration-300 overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-nt-purple/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header Block */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {!biasShield ? (
              <div className="w-10 h-10 rounded-full bg-nt-purple/15 border border-nt-purple/30 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-display font-bold text-nt-purple">
                  {candidate.candidateName.charAt(0).toUpperCase()}
                </span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center flex-shrink-0">
                <Shield size={16} className="text-gray-500" />
              </div>
            )}
            <div>
              <p className="text-white font-medium text-sm">
                {displayName}
              </p>
              <p className="text-gray-600 text-xs font-mono">{candidate.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleCompare}
              className={`p-1.5 rounded-lg border transition-all ${isCompare ? 'bg-nt-purple/20 border-nt-purple text-nt-purple' : 'bg-nt-bg-3 border-gray-800 text-gray-600 hover:border-gray-600'}`}
              title="Compare"
            >
              <Scale size={13} />
            </button>
            <button
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-900/30 text-gray-700 hover:text-red-400 transition-all"
              title="Remove candidate"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* JD Match Badging (Phase 3) */}
        {jdScore !== undefined && (
          <div className="mb-4 bg-nt-cyan/5 border border-nt-cyan/20 p-2.5 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-nt-cyan" />
              <span className="text-xs font-mono text-nt-cyan">JD MATCH</span>
            </div>
            <span className="font-display font-bold text-white text-sm">{jdScore}%</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border bg-nt-bg-3 border-gray-800 text-gray-500">
            <FileText size={9} /> Resume
          </span>
          {hasTranscript && (
            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border bg-nt-cyan/5 border-nt-cyan/20 text-nt-cyan">
              <Mic size={9} /> Interview
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
          <div className="bg-nt-bg-3 border border-gray-800/60 rounded-lg p-2.5">
            <p className="text-[10px] font-mono text-gray-700 mb-0.5">Knowledge base</p>
            <p className="text-sm font-mono text-white">{candidate.wordCount.toLocaleString()}</p>
          </div>
          <div className="bg-nt-bg-3 border border-gray-800/60 rounded-lg p-2.5">
            <p className="text-[10px] font-mono text-gray-700 mb-0.5">Transcript words</p>
            <p className="text-sm font-mono text-white">
              {hasTranscript ? candidate.fullTranscript.split(/\s+/).length : 0}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-800/60">
          <div className="flex items-center gap-1 text-[10px] font-mono text-gray-700">
            <Clock size={9} /> {timeAgo}
          </div>
          <div className="flex items-center gap-1 text-xs text-nt-purple font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Interview Twin <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </Link>
  );
}
