// components/ui/ProgressBar.tsx
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-gray-100 h-2.5', className)}>
      <div
        className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
