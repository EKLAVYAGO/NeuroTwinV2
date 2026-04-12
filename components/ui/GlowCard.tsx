'use client';

import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: React.ReactNode;
  glowColor?: 'cyan' | 'purple' | 'amber';
  className?: string;
  hover?: boolean;
}

export function GlowCard({
  children,
  glowColor = 'cyan',
  className,
  hover = true,
}: GlowCardProps) {
  const glowStyles = {
    cyan: {
      border: 'border-nt-border',
      shadow: 'shadow-glow-cyan',
      bg: 'bg-nt-bg-2',
      hover: 'hover:border-nt-cyan/30 hover:shadow-glow-cyan',
    },
    purple: {
      border: 'border-nt-border-2',
      shadow: 'shadow-glow-purple',
      bg: 'bg-nt-bg-2',
      hover: 'hover:border-nt-purple/40 hover:shadow-glow-purple',
    },
    amber: {
      border: 'border-amber-500/20',
      shadow: 'shadow-glow-amber',
      bg: 'bg-nt-bg-2',
      hover: 'hover:border-nt-amber/30 hover:shadow-glow-amber',
    },
  };

  const style = glowStyles[glowColor];

  return (
    <div
      className={cn(
        'relative rounded-2xl border backdrop-blur-sm transition-all duration-300',
        style.bg,
        style.border,
        hover && style.hover,
        className
      )}
    >
      {children}
    </div>
  );
}
