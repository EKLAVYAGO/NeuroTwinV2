import { NextResponse } from 'next/server';
import { getModel } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText) {
      return NextResponse.json({ error: 'Missing resume text' }, { status: 400 });
    }

    const systemPrompt = `You are an expert technical interviewer. You must analyze the provided resume text and generate exactly 8 highly specific interview questions tailored to the candidate's exact experience.
    
    RULES:
    1. Output EXACTLY 8 questions in a strict JSON array format.
    2. Questions 1-5 MUST be 'Technical'. They must interrogate specific technologies, architectural choices, or projects mentioned in the resume.
    3. Questions 6-8 MUST be 'Behavioral'. They must test conflict resolution, intrinsic drive, and culture fit.
    4. Provide the questions strictly adhering to this JSON schema:
    [
      {
        "type": "Technical" | "Behavioral",
        "title": "A short 2-4 word theme (e.g., 'API Optimization')",
        "glow": "purple" | "cyan" | "amber",
        "text": "The actual question to ask."
      }
    ]
    Use 'purple' for Technical and 'cyan' for Behavioral questions.
    Ensure "text" is spoken directly to the candidate (e.g. "I see you used React on X, why didn't you use Vue?").`;

    const model = getModel(systemPrompt);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Resume:\n${resumeText}` }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = result.response.text();
    const data = JSON.parse(responseText);

    return NextResponse.json(data);
  } catch (error) {
    console.error('API /twin/generate-questions error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
