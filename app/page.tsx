import Link from 'next/link';
import { Brain, ArrowRight, Shield, Mic, Users, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-nt-bg overflow-hidden flex flex-col">
      {/* Grid */}
      <div className="absolute inset-0 bg-grid opacity-50" />

      {/* Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-nt-cyan/4 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-nt-purple/5 blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-nt-cyan/10 border border-nt-cyan/30 flex items-center justify-center">
            <Brain size={15} className="text-nt-cyan" />
          </div>
          <span className="font-display text-base font-bold text-white tracking-widest">
            NEURO<span className="text-nt-cyan">TWIN</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-600 bg-nt-bg-2 border border-nt-border rounded-full px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-nt-cyan animate-pulse" />
          v2.0 — RAG Engine Active
        </div>
      </nav>

      {/* Hero text */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-8 pb-12">
        <div className="mb-6 inline-flex items-center gap-2 bg-nt-cyan/5 border border-nt-cyan/20 text-nt-cyan text-xs font-mono px-4 py-2 rounded-full">
          <Sparkles size={11} />
          Anti-hallucination · Evidence-cited · Verified
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-black text-white leading-none tracking-tight mb-4 max-w-3xl">
          THE ONLY AI TWIN
          <br />
          THAT{' '}
          <span
            className="text-nt-cyan"
            style={{ textShadow: '0 0 40px rgba(0,245,212,0.35)' }}
          >
            CITES ITS SOURCES
          </span>
        </h1>
        <p className="text-gray-500 text-base max-w-lg mb-3 leading-relaxed">
          Candidates build a verified knowledge base. Recruiters interrogate it
          — every answer backed by the exact quote that proves it.
        </p>
        <p className="text-xs font-mono text-gray-700">
          Select your role below to begin ↓
        </p>
      </div>

      {/* Dual card split */}
      <div className="relative z-10 flex-1 flex items-stretch justify-center gap-4 px-6 pb-12 max-w-4xl mx-auto w-full">
        {/* Candidate card */}
        <Link
          href="/candidate/setup"
          className="group flex-1 relative flex flex-col rounded-3xl border border-nt-border bg-nt-bg-2 overflow-hidden hover:border-nt-cyan/40 transition-all duration-500 hover:shadow-glow-cyan"
        >
          {/* Accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-nt-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Glow blob */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-nt-cyan/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative flex flex-col flex-1 p-8">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-nt-cyan/8 border border-nt-cyan/20 flex items-center justify-center mb-6 group-hover:border-nt-cyan/40 group-hover:bg-nt-cyan/12 transition-all duration-300">
              <Mic size={24} className="text-nt-cyan" />
            </div>

            {/* Label */}
            <span className="text-[10px] font-mono text-nt-cyan/60 tracking-widest uppercase mb-2">
              Role A
            </span>
            <h2 className="text-2xl font-display font-bold text-white mb-3 tracking-wide">
              I AM A<br />
              <span className="text-nt-cyan">CANDIDATE</span>
            </h2>

            <p className="text-gray-500 text-sm leading-relaxed flex-1">
              Upload your resume and complete a quick voice interview. We build
              a verified AI twin that speaks on your behalf — grounded only in
              your real experience.
            </p>

            {/* Steps */}
            <div className="mt-6 space-y-2">
              {[
                'Upload PDF resume',
                'Webcam identity check',
                'Voice interview capture',
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 text-xs text-gray-600"
                >
                  <span className="w-5 h-5 rounded-full bg-nt-bg-3 border border-gray-800 flex items-center justify-center text-[9px] font-mono font-bold text-gray-600">
                    {i + 1}
                  </span>
                  {s}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 flex items-center gap-2 text-nt-cyan text-sm font-medium">
              Start onboarding
              <ArrowRight
                size={15}
                className="translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300"
              />
            </div>
          </div>
        </Link>

        {/* Divider */}
        <div className="hidden md:flex flex-col items-center justify-center gap-3 flex-shrink-0">
          <div className="w-px flex-1 bg-gradient-to-b from-transparent via-gray-800 to-transparent" />
          <span className="text-xs font-mono text-gray-700 bg-nt-bg-2 border border-gray-800 rounded-full px-2.5 py-1">
            OR
          </span>
          <div className="w-px flex-1 bg-gradient-to-b from-transparent via-gray-800 to-transparent" />
        </div>

        {/* Recruiter card */}
        <Link
          href="/recruiter/dashboard"
          className="group flex-1 relative flex flex-col rounded-3xl border border-nt-border bg-nt-bg-2 overflow-hidden hover:border-nt-purple/50 transition-all duration-500 hover:shadow-glow-purple"
        >
          {/* Accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-nt-purple to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Glow blob */}
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-nt-purple/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative flex flex-col flex-1 p-8">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-nt-purple/8 border border-nt-purple/20 flex items-center justify-center mb-6 group-hover:border-nt-purple/50 group-hover:bg-nt-purple/12 transition-all duration-300">
              <Users size={24} className="text-nt-purple" />
            </div>

            {/* Label */}
            <span className="text-[10px] font-mono text-nt-purple/60 tracking-widest uppercase mb-2">
              Role B
            </span>
            <h2 className="text-2xl font-display font-bold text-white mb-3 tracking-wide">
              I AM A<br />
              <span className="text-nt-purple">RECRUITER</span>
            </h2>

            <p className="text-gray-500 text-sm leading-relaxed flex-1">
              Browse the talent pool and interview any candidate's AI twin in
              real time. Every answer is cited with exact evidence from their
              verified knowledge base.
            </p>

            {/* Features */}
            <div className="mt-6 space-y-2">
              {[
                'Browse talent pool',
                'Ask voice or text questions',
                'See evidence for every answer',
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 text-xs text-gray-600"
                >
                  <Shield
                    size={11}
                    className="text-nt-purple/60 flex-shrink-0"
                  />
                  {s}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 flex items-center gap-2 text-nt-purple text-sm font-medium">
              View talent pool
              <ArrowRight
                size={15}
                className="translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300"
              />
            </div>
          </div>
        </Link>
      </div>

      {/* Bottom strip */}
      <div className="relative z-10 border-t border-nt-border/40 px-8 py-4 flex items-center justify-center gap-6">
        {[
          'Gemini 1.5 Flash RAG',
          'Web Speech API',
          'pdfjs-dist',
          'Zero hallucination policy',
        ].map((t) => (
          <span key={t} className="text-[10px] font-mono text-gray-700">
            {t}
          </span>
        ))}
      </div>
    </main>
  );
}
