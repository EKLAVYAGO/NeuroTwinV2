'use client';

import { useState } from 'react';
import { Github, Loader2, Search, ArrowRight } from 'lucide-react';
import { GlowCard } from '@/components/ui/GlowCard';

interface GitHubSyncProps {
  onComplete: (data: string) => void;
}

export function GitHubSync({ onComplete }: GitHubSyncProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchGitHub = async () => {
    if (!username.trim()) {
      onComplete(''); // skip
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`https://api.github.com/users/${username.trim()}/repos?sort=updated&per_page=5`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('User not found');
        throw new Error('API Rate limit or error');
      }
      
      const repos = await res.json();
      if (!Array.isArray(repos) || repos.length === 0) {
        throw new Error('No public repositories found');
      }
      
      const formattedData = repos.map((r: any) => {
        return `- **${r.name}** (${r.language || 'Unknown'}): ${r.description || 'No description'} [⭐️ ${r.stargazers_count}]`;
      }).join('\n');
      
      onComplete(`GitHub Username: ${username.trim()}\n\nRecent Repositories:\n${formattedData}`);
    } catch (err: any) {
      setError(err.message || 'Failed to sync');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <GlowCard glowColor="purple" hover={false} className="p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-nt-purple/10 border border-nt-purple/30 flex items-center justify-center mb-4 shadow-glow-purple">
          <Github className="text-nt-purple" size={24} />
        </div>
        <h3 className="text-lg font-display text-white mb-2">Sync Code History</h3>
        <p className="text-sm text-gray-400 max-w-sm mb-6">
          Connect your GitHub to inject real-time coding history and recent commits into your Digital Twin's brain.
        </p>

        <div className="w-full max-w-sm relative mb-2">
          <input
            type="text"
            placeholder="GitHub Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            className="w-full bg-nt-bg-2 border border-nt-border rounded-xl pl-10 pr-4 py-3 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-nt-purple/50 transition-colors"
          />
          <Search className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
        </div>

        {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

        <div className="flex flex-col w-full max-w-sm gap-2 mt-4">
          <button
            onClick={fetchGitHub}
            disabled={isLoading || !username.trim()}
            className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all bg-nt-purple/10 border border-nt-purple text-nt-purple hover:bg-nt-purple/20 shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Github size={16} />}
            {isLoading ? 'Syncing...' : 'Sync Repositories'}
          </button>
          
          <button
            onClick={() => onComplete('')}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl text-xs text-gray-500 hover:text-gray-300 flex items-center justify-center gap-1 transition-colors"
          >
            Skip this step <ArrowRight size={12} />
          </button>
        </div>
      </GlowCard>
    </div>
  );
}
