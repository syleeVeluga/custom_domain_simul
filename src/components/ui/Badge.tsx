// components/ui/Badge.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant: 'pending' | 'active' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeProps['variant'], string> = {
  pending:
    'bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-600/20',
  active: 'bg-green-50 text-green-700 border-green-200 ring-green-600/20',
  error: 'bg-red-50 text-red-700 border-red-200 ring-red-600/20',
  info: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20',
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        variants[variant],
        className
      )}
    >
      {variant === 'pending' && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-500" />
        </span>
      )}
      {variant === 'active' && (
        <span className="h-2 w-2 rounded-full bg-green-500" />
      )}
      {variant === 'error' && (
        <span className="h-2 w-2 rounded-full bg-red-500" />
      )}
      {children}
    </span>
  );
}
