import { NextResponse } from 'next/server';
import { getModel } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { action, candidateBase, analyticsContext, culture } = await req.json();

    if (!action || !candidateBase) {
      return NextResponse.json({ error: 'Missing payload for toolkit' }, { status: 400 });
    }

    let systemPrompt = '';

    if (action === 'synergy') {
      systemPrompt = `You are a corporate synergy evaluator. The recruiter wants to place this candidate in a '${culture}' company culture. 
      Given the candidate's history and metrics: ${JSON.stringify(analyticsContext)}, return a strict JSON object:
      {
        "synergy_score": (0-100),
        "one_sentence_forecast": "Short prediction of their fit."
      }`;
    } else if (action === 'handoff') {
      systemPrompt = `You are an expert technical interviewer handing off a candidate to the final human hiring manager.
      Analyze the candidate's metrics to find their weakest areas: ${JSON.stringify(analyticsContext)}.
      Output EXACTLY 3 highly difficult, probing questions the manager should ask them to stress-test their weaknesses.
      Return strict JSON:
      {
        "questions": [
          { "theme": "string", "question": "string" },
          { "theme": "string", "question": "string" },
          { "theme": "string", "question": "string" }
        ]
      }`;
    } else if (action === 'email') {
      systemPrompt = `You are the recruiter 'NeuroTwin AI'. Draft a personalized 'Next Steps' email to the candidate.
      Reference exactly 1-2 specific impressive technical things they mentioned in their knowledge base: ${candidateBase.substring(0, 1000)}...
      Make it warm, professional, and max 3 paragraphs.
      Return strict JSON:
      {
        "subject": "string",
        "body": "string (use \n for line breaks)"
      }`;
    }

    const model = getModel(systemPrompt);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Execute.' }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
    });

    return NextResponse.json(JSON.parse(result.response.text()));
  } catch (error) {
    console.error('API /twin/toolkit error:', error);
    return NextResponse.json({ error: 'Toolkit generation failed' }, { status: 500 });
  }
}
