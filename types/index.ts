// ── Candidate ──────────────────────────────────────────────────────────────
export interface CandidateProfile {
  id: string;
  candidateName: string;
  fileName: string;
  resumeText: string;
  verifiedTranscript: string;
  candidateKnowledgeBase: string;
  uploadedAt: string;
  wordCount: number;
}

// ── Chat ───────────────────────────────────────────────────────────────────
export type MessageRole = 'recruiter' | 'twin';
export type SourceType = 'Resume' | 'Live Interview' | 'Unknown';

export interface TwinMessage {
  id: string;
  role: MessageRole;
  content: string; // the rendered text (answer or recruiter question)
  evidenceQuote?: string; // exact quote from knowledge base
  sourceType?: SourceType; // where it came from
  timestamp: Date;
}

export interface EvidenceItem {
  id: string;
  question: string;
  evidenceQuote: string;
  sourceType: SourceType;
  timestamp: Date;
}

// ── API contracts ──────────────────────────────────────────────────────────
export interface TwinChatRequest {
  question: string;
  candidateKnowledgeBase: string;
  conversationHistory: { role: string; content: string }[];
}

export interface TwinChatResponse {
  answer: string;
  evidence_quote: string;
  source_type: SourceType;
  error?: string;
}

// ── UI state ───────────────────────────────────────────────────────────────
export type MicState = 'idle' | 'recording' | 'processing';
export type OnboardingStep = 1 | 2 | 3 | 'complete';

// ── Analytics & Voice ──────────────────────────────────────────────────────
export interface AnalyticsResponse {
  metrics: {
    technical_depth: number;
    communication_clarity: number;
    confidence_level: number;
    adaptability: number;
  };
  personality_archetype: string;
  key_strength: string;
  red_flag_warning: string;
}

export const VOICE_IDS = {
  male: 'iWNf11sz1GrUE4ppxTOL',
  female: '9SsFrOutdZkCkU5hIoQm',
};
