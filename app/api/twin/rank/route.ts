import { NextResponse } from 'next/server';
import { getModel } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { jd, candidates } = await req.json();

    if (!jd || !candidates || !Array.isArray(candidates)) {
      return NextResponse.json({ error: 'Missing jd or candidates payload' }, { status: 400 });
    }

    const payloadText = candidates.map(
      (c) => `--- CANDIDATE ID: ${c.id} ---\n${c.candidateKnowledgeBase}\n`
    ).join('\n');

    const systemPrompt = `You are an elite automated recruiter. You are given a Job Description and a list of Candidate Knowledge Bases.
    
    RULES:
    1. Evaluate each candidate against the Job Description.
    2. Assign a match score from 0 to 100 based strictly on technical mapping and stated experience.
    3. Output EXACTLY a JSON array of objects with schema: [{ "id": "CANDIDATE_ID", "score": NUMBER }]
    4. Do not output anything other than the JSON array.
    
    JOB DESCRIPTION:
    ${jd}
    `;

    const model = getModel(systemPrompt);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: payloadText }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temp for analytical ranking
      },
    });

    const responseText = result.response.text();
    const data = JSON.parse(responseText);

    return NextResponse.json(data);
  } catch (error) {
    console.error('API /twin/rank error:', error);
    return NextResponse.json({ error: 'Ranking failed' }, { status: 500 });
  }
}
