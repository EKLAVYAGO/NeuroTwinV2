import { NextRequest, NextResponse } from 'next/server';
import { getModel, buildSystemPrompt } from '@/lib/gemini';
import type { TwinChatRequest, TwinChatResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body: TwinChatRequest = await req.json();
    const { question, candidateKnowledgeBase, conversationHistory } = body;

    if (!question?.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }
    if (!candidateKnowledgeBase?.trim()) {
      return NextResponse.json(
        { error: 'candidateKnowledgeBase is required' },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(candidateKnowledgeBase);
    const model = getModel(systemPrompt);

    // Build prior conversation for multi-turn context
    const history = (conversationHistory || []).slice(-8).map((msg) => ({
      role: msg.role === 'twin' ? ('model' as const) : ('user' as const),
      parts: [{ text: msg.content }],
    }));

    const result = await model.generateContent({
      contents: [...history, { role: 'user', parts: [{ text: question }] }],
      generationConfig: {
        temperature: 0.2, // low — we want grounded, not creative
        maxOutputTokens: 600,
      },
    });

    const rawText = result.response.text().trim();

    // Strip markdown fences if Gemini wraps output anyway
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed: TwinChatResponse;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Graceful fallback — treat full text as the answer
      parsed = {
        answer: rawText,
        evidence_quote: '',
        source_type: 'Unknown',
      };
    }

    // Sanitize fields
    parsed.answer =
      parsed.answer || 'I do not have enough verified data to answer that.';
    parsed.evidence_quote = parsed.evidence_quote || '';
    parsed.source_type = (
      ['Resume', 'Live Interview', 'Unknown'] as const
    ).includes(parsed.source_type as 'Resume' | 'Live Interview' | 'Unknown')
      ? parsed.source_type
      : 'Unknown';

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[twin/chat] Error:', err.message);
    return NextResponse.json(
      {
        answer: 'A system error occurred. Please try again.',
        evidence_quote: '',
        source_type: 'Unknown',
        error: err.message,
      },
      { status: 500 }
    );
  }
}
