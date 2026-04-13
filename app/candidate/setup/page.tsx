'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { OnboardingProgress } from '@/components/candidate/OnboardingProgress';
import { ResumeUploader } from '@/components/candidate/ResumeUploader';
import { GitHubSync } from '@/components/candidate/GitHubSync';
import { WebcamVerification } from '@/components/candidate/WebcamVerification';
import { VoiceCapture } from '@/components/candidate/VoiceCapture';
import { GlowCard } from '@/components/ui/GlowCard';
import { addCandidate } from '@/lib/store';
import type { OnboardingStep } from '@/types';

export default function CandidateSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [githubData, setGithubData] = useState('');
  const [webcamReady, setWebcamReady] = useState(false);
  const [createdId, setCreatedId] = useState('');
  const [prompts, setPrompts] = useState<any[]>([]);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

  const handleResumeExtracted = async (text: string, name: string) => {
    setResumeText(text);
    setFileName(name);
    setIsGeneratingPrompts(true);
    
    try {
      const res = await fetch('/api/twin/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text }),
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setPrompts(data);
      } else {
        setPrompts([{ type: 'Technical', title: 'Fallback Error', glow: 'purple', text: 'Please explain your background.' }]);
      }
    } catch {
       setPrompts([{ type: 'Technical', title: 'Fallback Error', glow: 'purple', text: 'Please explain your background.' }]);
    }
    
    setIsGeneratingPrompts(false);
    setStep(2);
  };

  const handleVerified = (fullTranscript: string, audioData?: string) => {
    const candidateName =
      fileName
        .replace('.pdf', '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Candidate';

    let extractedUsername = 'torvalds'; // default fallback for demo
    if (githubData.includes('github.com/')) {
        const parts = githubData.split('github.com/');
        if (parts[1]) extractedUsername = parts[1].split('/')[0].split('\n')[0].trim();
    } else if (githubData.trim()) {
        extractedUsername = githubData.split('\n')[0].trim();
    }

    const profile = addCandidate({
      resumeText,
      fullTranscript,
      githubData,
      githubUsername: extractedUsername,
      audioData,
      candidateName,
      fileName,
      uploadedAt: new Date().toISOString(),
    });

    setCreatedId(profile.id);
    setStep('complete');
    setTimeout(() => router.push('/recruiter/dashboard'), 2000);
  };

  return (
    <div className="min-h-screen bg-nt-bg bg-grid relative">
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full bg-nt-cyan/3 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 rounded-full bg-nt-purple/3 blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-nt-border/50">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-400 text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Home
          </Link>
          <div className="w-px h-4 bg-gray-800" />
          <div className="flex items-center gap-2">
            <Brain size={13} className="text-nt-cyan" />
            <span className="font-display text-sm font-bold text-white tracking-wider">
              NEURO<span className="text-nt-cyan">TWIN</span>
            </span>
          </div>
        </div>
        <span className="text-xs font-mono text-gray-700">Candidate Setup</span>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-display font-bold text-white mb-2">
            Build Your <span className="text-nt-cyan">Digital Twin</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Three steps to create a verified AI that speaks on your behalf
          </p>
        </div>

        <div className="mb-10">
          <OnboardingProgress
            currentStep={step === 'complete' ? 5 : (step as number)}
          />
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Step 1 */}
          {step === 1 && (
            <GlowCard glowColor="cyan" hover={false} className="p-6 relative">
              <h2 className="text-base font-semibold text-white mb-1">
                Upload Your Resume
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                Extracted locally — your raw text becomes the first layer of
                your knowledge base.
              </p>
              
              {!isGeneratingPrompts ? (
                <ResumeUploader onExtracted={handleResumeExtracted} />
              ) : (
                <div className="py-12 flex flex-col items-center justify-center animate-pulse">
                  <Brain className="text-nt-purple mb-4 animate-bounce" size={32} />
                  <p className="text-nt-purple font-mono text-sm tracking-widest uppercase">Analyzing Resume</p>
                  <p className="text-gray-500 text-xs mt-2">Generating 8 custom tailored questions...</p>
                </div>
              )}
            </GlowCard>
          )}

          {/* Step 2: GitHub Integration */}
          {step === 2 && (
            <GitHubSync
              onComplete={(data) => {
                setGithubData(data);
                setStep(3);
              }}
            />
          )}

          {/* Step 3 */}
          {step === 3 && (
            <GlowCard glowColor="cyan" hover={false} className="p-6">
              <h2 className="text-base font-semibold text-white mb-1">
                Identity Verification
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                Prove you're a real human, not a bot submitting on your behalf.
              </p>
              <WebcamVerification onReady={() => setWebcamReady(true)} />
              {webcamReady && (
                <button
                  onClick={() => setStep(4)}
                  className="mt-4 w-full py-3 rounded-xl font-medium text-sm bg-nt-cyan/10 border border-nt-cyan text-nt-cyan hover:bg-nt-cyan/20 transition-all shadow-glow-cyan"
                >
                  ✓ Confirmed — Proceed to Voice Interview
                </button>
              )}
            </GlowCard>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlowCard
                glowColor="cyan"
                hover={false}
                className="overflow-hidden"
              >
                <div className="p-4 border-b border-nt-border">
                  <h3 className="text-sm font-semibold text-white">
                    Live Identity Feed
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Active during your recording
                  </p>
                </div>
                <WebcamVerification compact autoStart={true} />
              </GlowCard>

              <GlowCard glowColor="purple" hover={false} className="p-5">
                <h2 className="text-sm font-semibold text-white mb-1">
                  Voice Interview
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Your answer becomes the second layer of the knowledge base —
                  the "Live Interview" source.
                </p>
                <VoiceCapture prompts={prompts} onVerified={handleVerified} />
              </GlowCard>
            </div>
          )}

          {/* Complete */}
          {step === 'complete' && (
            <GlowCard
              glowColor="cyan"
              hover={false}
              className="p-10 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-nt-cyan/10 border border-nt-cyan/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-nt-cyan" />
              </div>
              <h2 className="text-xl font-display font-bold text-white mb-2">
                Twin <span className="text-nt-cyan">Online</span>
              </h2>
              <p className="text-gray-500 text-sm mb-1">
                Your knowledge base is ready. Redirecting to the talent pool…
              </p>
              {createdId && (
                <p className="text-xs font-mono text-gray-700 mt-2">
                  ID: {createdId}
                </p>
              )}
            </GlowCard>
          )}
        </div>
      </div>
    </div>
  );
}
