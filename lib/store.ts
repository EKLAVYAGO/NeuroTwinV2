import { generateId } from './utils';
import { mockCandidates } from './mockData';

export interface CandidateProfile {
  id: string;
  candidateName: string;
  fileName: string;
  resumeText: string;
  fullTranscript: string;
  githubUsername?: string;
  githubData?: string;
  audioData?: string;
  candidateKnowledgeBase: string;
  uploadedAt: string;
  wordCount: number;
}

const _pool: Map<string, CandidateProfile> = new Map(mockCandidates.map(c => [c.id, c]));

export function addCandidate(
  data: Omit<CandidateProfile, 'id' | 'candidateKnowledgeBase' | 'wordCount'>
): CandidateProfile {
  const id = generateId();

  const candidateKnowledgeBase = [
    '=== RESUME ===',
    data.resumeText.trim(),
    '',
    '=== GITHUB COMMITS & REPOSITORIES ===',
    data.githubData?.trim() || '(No GitHub data provided.)',
    '',
    '=== COMPREHENSIVE INTERVIEW TRANSCRIPT ===',
    data.fullTranscript?.trim() || '(No transcript recorded.)',
  ].join('\n');

  const wordCount = candidateKnowledgeBase.split(/\s+/).filter(Boolean).length;

  const profile: CandidateProfile = {
    ...data,
    id,
    candidateKnowledgeBase,
    wordCount,
  };

  _pool.set(id, profile);
  return profile;
}

export function getCandidate(id: string): CandidateProfile | null {
  return _pool.get(id) ?? null;
}

export function getAllCandidates(): CandidateProfile[] {
  return Array.from(_pool.values()).sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export function removeCandidate(id: string): void {
  _pool.delete(id);
}

export function clearPool(): void {
  _pool.clear();
}
