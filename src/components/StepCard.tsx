// components/StepCard.tsx
// 각 단계(Step 1, 2, 3)를 표시하는 카드 컴포넌트

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

type StepStatus = 'locked' | 'current' | 'completed' | 'error';

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  status: StepStatus;
  children: React.ReactNode;
}

export function StepCard({
  step,
  title,
  description,
  status,
  children,
}: StepCardProps) {
  const [open, setOpen] = useState(status === 'current');

  const isExpandable = status !== 'locked';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: step * 0.1 }}
      className={cn(
        'rounded-xl border bg-white transition-shadow',
        status === 'current' && 'border-blue-200 shadow-md ring-1 ring-blue-100',
        status === 'completed' && 'border-green-200 bg-green-50/30',
        status === 'error' && 'border-red-200',
        status === 'locked' && 'border-gray-200 opacity-50'
      )}
    >
      {/* 헤더 */}
      <button
        type="button"
        onClick={() => isExpandable && setOpen(!open)}
        disabled={!isExpandable}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        {/* Step 번호 / 체크 아이콘 */}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            status === 'current' && 'bg-blue-600 text-white',
            status === 'completed' && 'bg-green-600 text-white',
            status === 'error' && 'bg-red-600 text-white',
            status === 'locked' && 'bg-gray-200 text-gray-500'
          )}
        >
          {status === 'completed' ? (
            <Check className="h-4 w-4" />
          ) : (
            step
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>

        {isExpandable && (
          <span className="text-gray-400">
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        )}
      </button>

      {/* 바디 */}
      {open && isExpandable && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gray-100 px-5 py-4"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

// ── DNS Record Row (Host / Value 복사) ────────────────────────
interface RecordRowProps {
  label: string;
  value: string;
}

export function RecordRow({ label, value }: RecordRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="truncate font-mono text-sm text-gray-800">{value}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={handleCopy}>
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
