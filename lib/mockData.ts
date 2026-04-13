import { CandidateProfile } from './store';

export const mockCandidates: CandidateProfile[] = [
  {
    id: 'DEMO-ALICE-1234',
    candidateName: 'Alice Chen',
    fileName: 'Alice_Chen_Resume.pdf',
    resumeText: 'Senior Backend Engineer experienced in distributed systems, Go, and Kafka. Led migration from monorepo to microservices.',
    fullTranscript: `Question 1 [Technical]: Detail your most complex project.\nAnswer: I redesigned our core payment gateway using Go and gRPC, reducing latency by 45%.\n\nQuestion 2 [Behavioral]: Describe a conflict with leadership.\nAnswer: My manager wanted to skip writing tests to ship faster. I compromised by writing critical path tests and deferring edge cases to a fast follow, protecting system stability while meeting the deadline.`,
    githubUsername: 'gaearon',
    githubData: 'alice-backend\nGo • 15 repositories • 422 stars\nCore contributor to open source distributed cache.',
    candidateKnowledgeBase: '=== RESUME LOG ===\nSenior Backend... === LIVE INTERVIEW ===\nQuestion 1... === GITHUB ===\nGo...',
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    wordCount: 1250
  },
  {
    id: 'DEMO-BOB-5678',
    candidateName: 'Bob Martinez',
    fileName: 'Bob_Martinez_Frontend.pdf',
    resumeText: 'Frontend Architect. 8 years React experience, deep knowledge of Next.js, Framer Motion, and WebGL.',
    fullTranscript: `Question 1 [Technical]: Explain a controversial design decision.\nAnswer: I insisted on moving our SPA to SSR with Next.js despite team pushback. It ultimately improved our SEO by 300% and reduced initial load time.\n\nQuestion 2 [Behavioral]: What drives you?\nAnswer: I am absolutely obsessed with creating pixel-perfect, 60fps animations. Even a tiny frame drop bothers me.`,
    githubUsername: 'torvalds',
    githubData: 'bobweb\nTypeScript • 21 repositories • 120 stars\nReact transition library author.',
    candidateKnowledgeBase: '=== RESUME LOG ===\nFrontend Architect... === LIVE INTERVIEW ===\nQuestion 1... === GITHUB ===\nTypeScript...',
    uploadedAt: new Date(Date.now() - 172800000).toISOString(),
    wordCount: 980
  },
  {
    id: 'DEMO-CHARLIE-9012',
    candidateName: 'Charlie Davis',
    fileName: 'Charlie_Davis_DevOps.pdf',
    resumeText: 'DevOps & SRE Manager. Kubernetes, Terraform, AWS. Managed infrastructure for $2M ARR SaaS platform.',
    fullTranscript: `Question 1 [Technical]: How do you handle scaling?\nAnswer: I implemented an auto-scaling cluster on K8s that scales pods based on custom metrics like queue depth, not just CPU.\n\nQuestion 2 [Behavioral]: Where will you make an impact?\nAnswer: I want to completely automate the CI/CD pipeline so developers never have to think about deployments again.`,
    githubUsername: 'kelseyhightower',
    githubData: 'charlie-ops\nHCL • 9 repositories • 45 stars\nTerraform modules collection.',
    candidateKnowledgeBase: '=== RESUME LOG ===\nDevOps... === LIVE INTERVIEW ===\nQuestion 1... === GITHUB ===\nHCL...',
    uploadedAt: new Date(Date.now() - 259200000).toISOString(),
    wordCount: 1100
  },
  {
    id: 'DEMO-DIANA-3456',
    candidateName: 'Diana Prince',
    fileName: 'Diana_Prince_Data.pdf',
    resumeText: 'Lead Data Scientist. PyTorch, Transformer Models, NLP. Built recommendation engine increasing engagement by 40%.',
    fullTranscript: `Question 1 [Technical]: Describe your models.\nAnswer: I built a multi-modal RAG architecture using LangChain and open-source embedding models to reduce our OpenAI costs by 60%.\n\nQuestion 2 [Behavioral]: Conflict resolution?\nAnswer: Product wanted to launch the AI immediately. I proved statistically that the hallucination rate was unsafe, delaying launch by 2 weeks but preventing a PR disaster.`,
    githubUsername: 'karpathy',
    githubData: 'diana-ai\nPython • 34 repositories • 890 stars\nOpen source NLP evaluation framework.',
    candidateKnowledgeBase: '=== RESUME LOG ===\nLead Data... === LIVE INTERVIEW ===\nQuestion 1... === GITHUB ===\nPython...',
    uploadedAt: new Date(Date.now() - 345600000).toISOString(),
    wordCount: 1420
  }
];
