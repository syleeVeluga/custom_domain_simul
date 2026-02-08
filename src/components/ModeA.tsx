// components/ModeA.tsx
// Zero Data State — 초기 진입 화면

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ModeAProps {
  loading: boolean;
  error: string | null;
  onRegister: (domain: string) => Promise<boolean>;
}

export function ModeA({ loading, error, onRegister }: ModeAProps) {
  const [domainInput, setDomainInput] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = domainInput.trim().toLowerCase();
    if (!trimmed) return;

    const success = await onRegister(trimmed);
    if (!success) {
      // 에러 시 shake 애니메이션
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex min-h-[70vh] flex-col items-center justify-center px-4"
    >
      {/* 아이콘 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100"
      >
        <Globe className="h-8 w-8 text-blue-600" />
      </motion.div>

      {/* 헤드라인 */}
      <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        나만의 도메인으로
        <br />
        브랜딩을 강화하세요
      </h1>
      <p className="mb-8 max-w-md text-center text-gray-500">
        커스텀 도메인을 연결하면 고객에게 더 전문적인 브랜드 경험을 제공할 수
        있습니다.
      </p>

      {/* 입력 폼 */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex w-full max-w-lg flex-col gap-3 sm:flex-row',
          shake && 'animate-shake'
        )}
      >
        <input
          type="text"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          placeholder="app.yourcompany.com"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-lg shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          disabled={loading}
        />
        <Button type="submit" size="lg" loading={loading}>
          도메인 연결 시작하기
        </Button>
      </form>

      {/* 에러 메시지 */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm font-medium text-red-600"
        >
          {error}
        </motion.p>
      )}

      {/* Magic Domain 가이드 */}
      <div className="mt-12 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Simulation Guide
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-500 sm:grid-cols-3">
          <span>
            <code className="text-gray-700">success.com</code> — 전체 성공
          </span>
          <span>
            <code className="text-gray-700">fail-txt.com</code> — TXT 실패
          </span>
          <span>
            <code className="text-gray-700">fail-cname.com</code> — CNAME 실패
          </span>
          <span>
            <code className="text-gray-700">ssl-hang.com</code> — SSL 지연
          </span>
          <span>
            <code className="text-gray-700">error.com</code> — 시스템 에러
          </span>
          <span>
            <code className="text-gray-700">기타</code> — 기본 성공
          </span>
        </div>
      </div>
    </motion.div>
  );
}
