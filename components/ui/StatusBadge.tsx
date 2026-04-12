'use client';

type Status =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'verified'
  | 'error'
  | 'active';

interface StatusBadgeProps {
  status: Status;
  label?: string;
}

const statusConfig: Record<
  Status,
  { color: string; dot: string; label: string }
> = {
  idle: {
    color: 'text-gray-400 bg-gray-800/60 border-gray-700/50',
    dot: 'bg-gray-500',
    label: 'Idle',
  },
  recording: {
    color: 'text-red-400 bg-red-900/30 border-red-700/50',
    dot: 'bg-red-400 animate-pulse',
    label: 'Recording',
  },
  processing: {
    color: 'text-nt-purple bg-purple-900/30 border-purple-700/50',
    dot: 'bg-nt-purple animate-pulse',
    label: 'Processing',
  },
  verified: {
    color: 'text-nt-cyan bg-cyan-900/20 border-cyan-700/30',
    dot: 'bg-nt-cyan',
    label: 'Verified',
  },
  active: {
    color: 'text-nt-cyan bg-cyan-900/20 border-cyan-700/30',
    dot: 'bg-nt-cyan animate-pulse',
    label: 'Active',
  },
  error: {
    color: 'text-red-400 bg-red-900/30 border-red-700/50',
    dot: 'bg-red-400',
    label: 'Error',
  },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${config.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label || config.label}
    </span>
  );
}
