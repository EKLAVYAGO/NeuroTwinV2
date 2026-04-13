import { NextRequest, NextResponse } from 'next/server';
import { getModel } from '@/lib/gemini';
import type { AnalyticsResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateKnowledgeBase } = body;

    if (!candidateKnowledgeBase?.trim()) {
      return NextResponse.json(
        { error: 'candidateKnowledgeBase is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a highly critical, expert technical recruiter and industrial psychologist. Analyze the provided knowledge base (resume, code history, and spoken interview transcripts).
    
    1. Evaluate the candidate HONESTLY. Do not default to "innovator" or generic praise.
    2. Score metrics from 0 to 100 based strictly on evidence. 
    3. Look for technical depth, code quality, communication, and behavioral traits.
    4. Return a STRICT JSON object matching this exact schema:
{
  "metrics": {
    "technical_depth": (number 0-100),
    "system_design": (number 0-100),
    "problem_solving": (number 0-100),
    "code_quality_focus": (number 0-100),
    "communication_clarity": (number 0-100),
    "adaptability": (number 0-100),
    "leadership_ownership": (number 0-100),
    "cultural_alignment": (number 0-100)
  },
  "personality_archetype": "(Specific archetype e.g., 'The Pragmatic Builder', 'The Maverick', 'The Analytical Solver')",
  "detailed_summary": "(3-4 sentences detailing their exact technical strengths, behavioral tendencies, and overall vibe)",
  "recommended_role": "(E.g., 'Senior Backend Engineer', 'Junior Frontend Developer', 'Engineering Manager')",
  "key_strength": "(One short sentence highlighting their best attribute)",
  "red_flag_warning": "(One short sentence highlighting a potential weakness, gap in knowledge, or 'None detected')"
}`;

    const model = getModel(systemPrompt);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: candidateKnowledgeBase }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 800,
        responseMimeType: 'application/json',
      },
    });

    const rawText = result.response.text().trim();
    const cleanedText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    let parsed: AnalyticsResponse;

    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      throw new Error(
        'Failed to parse Gemini response as JSON. Raw: ' + rawText
      );
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[twin/analyze] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
