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

    const systemPrompt = `You are an expert industrial psychologist and technical recruiter. Analyze the provided candidate text (resume + spoken interview transcript). Look for filler words, technical depth, and communication style. Evaluate the candidate and return a strict JSON object matching this exact schema:
{
  "metrics": {
    "technical_depth": (number 0-100),
    "communication_clarity": (number 0-100),
    "confidence_level": (number 0-100, lower if transcript has many 'ums', 'uhs', or hesitations),
    "adaptability": (number 0-100)
  },
  "personality_archetype": "(e.g., 'The Architect', 'The Executor', etc.)",
  "key_strength": "(One short sentence)",
  "red_flag_warning": "(One short sentence highlighting a potential weakness or area to probe, or 'None detected')"
}`;

    const model = getModel();

    const result = await model.generateContent({
      systemInstruction: { parts: [{ text: systemPrompt }] },
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
