# NeuroTwin — AI Digital Twin Recruitment Platform

> An interactive AI recruitment platform where candidates create verified digital twins that recruiters can interview in real time.

## Features

- **PDF Resume Extraction** — client-side extraction using `pdfjs-dist`
- **Webcam Identity Verification** — live feed during candidate recording
- **Voice Capture** — `webkitSpeechRecognition` for verified interview transcript
- **Gemini AI Twin Brain** — RAG-powered Q&A grounded in candidate data only
- **ElevenLabs Voice Synthesis** — the twin speaks back to the recruiter
- **Evidence Board** — every answer cites the exact source material that proves it

## Setup & Team Collaboration

```bash
# 1. Install dependencies (this also installs our formatting hooks)
npm install

# 2. Set up your environment variables
# Copy the example file:
cp .env.example .env.local
# Then edit .env.local and add your actual API keys. NEVER commit .env.local!
```

> **Note on Contributing:** We use **Prettier** and **Husky** to ensure code formatting stays consistent across the team. Your code will be automatically formatted when you run `git commit`.

```bash
# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage Flow

1. **Candidate** → `/candidate`
   - Upload PDF resume
   - Enable webcam (identity verification)
   - Record verbal explanation of their best project

2. **Recruiter** → `/recruiter` (auto-redirect after candidate completes)
   - Hold mic button to ask a question
   - Twin responds with AI-generated answer + ElevenLabs voice
   - Evidence board updates with the exact source quote that backs the answer

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| AI Brain | Google Gemini 1.5 Flash |
| Voice Synthesis | ElevenLabs REST API |
| PDF Parsing | pdfjs-dist 3.11 |
| Speech-to-Text | Web Speech API (Chrome) |
| Icons | Lucide React |

## Browser Support

- **Chrome** — fully supported (Speech Recognition + all features)
- **Firefox** — partial (no speech recognition; text input fallback available)
- **Safari** — partial (no speech recognition)

## Architecture

```
app/candidate/page.tsx     — 3-step onboarding wizard
app/recruiter/page.tsx     — recruiter dashboard
app/api/twin/chat/route.ts — Gemini AI endpoint (RAG)
app/api/twin/speak/route.ts — ElevenLabs TTS endpoint
lib/store.ts               — in-memory session context
```
