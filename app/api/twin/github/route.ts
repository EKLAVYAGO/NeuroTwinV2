import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=3`, {
      headers
    });

    if (!response.ok) {
       return NextResponse.json({ error: 'GitHub fetch failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API /twin/github error:', error);
    return NextResponse.json({ error: 'GitHub fetch failed' }, { status: 500 });
  }
}
