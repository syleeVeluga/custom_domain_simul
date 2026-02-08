// components/ModeB.tsx
// Dashboard State — 도메인 등록 후 관리 화면

import { motion } from 'framer-motion';
import { Shield, Unlink, AlertCircle } from 'lucide-react';
import { CustomDomain, DomainStatus } from '@/types/domain';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StepCard, RecordRow } from '@/components/StepCard';

interface ModeBProps {
  domain: CustomDomain;
  loading: boolean;
  error: string | null;
  onVerifyTxt: () => Promise<void>;
  onVerifyCname: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

// ── 상태 → 배지 매핑 ─────────────────────────────────────────
function getStatusBadge(status: DomainStatus) {
  switch (status) {
    case DomainStatus.PENDING_VERIFICATION:
      return <Badge variant="pending">검증 대기중</Badge>;
    case DomainStatus.VERIFIED:
      return <Badge variant="info">TXT 검증 완료</Badge>;
    case DomainStatus.CNAME_PENDING:
      return <Badge variant="pending">CNAME 대기</Badge>;
    case DomainStatus.SSL_PROVISIONING:
      return <Badge variant="pending">SSL 발급중</Badge>;
    case DomainStatus.ACTIVE:
      return <Badge variant="active">Active</Badge>;
    case DomainStatus.ERROR:
      return <Badge variant="error">Error</Badge>;
  }
}

// ── Step 상태 결정 ────────────────────────────────────────────
type StepStatus = 'locked' | 'current' | 'completed' | 'error';

function getStepStatuses(domain: CustomDomain): [StepStatus, StepStatus, StepStatus] {
  const { status, txtRecord, cnameRecord } = domain;

  // Step 1: TXT
  let s1: StepStatus = 'locked';
  if (status === DomainStatus.PENDING_VERIFICATION) s1 = 'current';
  else if (txtRecord.verified) s1 = 'completed';
  else if (status === DomainStatus.ERROR && !txtRecord.verified) s1 = 'error';

  // Step 2: CNAME
  let s2: StepStatus = 'locked';
  if (txtRecord.verified && !cnameRecord.verified && status !== DomainStatus.ERROR) {
    s2 = 'current';
  } else if (cnameRecord.verified) {
    s2 = 'completed';
  } else if (status === DomainStatus.ERROR && txtRecord.verified) {
    s2 = 'error';
  }

  // Step 3: SSL
  let s3: StepStatus = 'locked';
  if (status === DomainStatus.SSL_PROVISIONING) s3 = 'current';
  else if (status === DomainStatus.ACTIVE) s3 = 'completed';

  return [s1, s2, s3];
}

export function ModeB({
  domain,
  loading,
  error,
  onVerifyTxt,
  onVerifyCname,
  onDisconnect,
}: ModeBProps) {
  const [step1, step2, step3] = getStepStatuses(domain);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-2xl px-4 py-10"
    >
      {/* ── Status Header ───────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{domain.domain}</h2>
            <p className="text-xs text-gray-500">
              등록일: {domain.createdAt.toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(domain.status)}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDisconnect}
            loading={loading}
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Unlink className="h-4 w-4" />
            연결 해제
          </Button>
        </div>
      </div>

      {/* ── 에러 알림 ────────────────────────────────────────── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* ── Steps ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {/* Step 1: TXT Verification */}
        <StepCard
          step={1}
          title="TXT 레코드 검증"
          description="DNS에 TXT 레코드를 추가하여 도메인 소유권을 증명합니다."
          status={step1}
        >
          <div className="space-y-3">
            <RecordRow label="Host" value={domain.txtRecord.host} />
            <RecordRow label="Value" value={domain.txtRecord.value} />
            <div className="pt-2">
              <Button
                onClick={onVerifyTxt}
                loading={loading}
                disabled={step1 !== 'current'}
                size="sm"
              >
                검증 확인
              </Button>
            </div>
          </div>
        </StepCard>

        {/* Step 2: CNAME Configuration */}
        <StepCard
          step={2}
          title="CNAME 레코드 설정"
          description="CNAME 레코드를 추가하여 도메인을 서비스에 연결합니다."
          status={step2}
        >
          <div className="space-y-3">
            <RecordRow label="Host" value={domain.cnameRecord.host} />
            <RecordRow label="Target" value={domain.cnameRecord.target} />
            <div className="pt-2">
              <Button
                onClick={onVerifyCname}
                loading={loading}
                disabled={step2 !== 'current'}
                size="sm"
              >
                연결 확인
              </Button>
            </div>
          </div>
        </StepCard>

        {/* Step 3: SSL Provisioning */}
        <StepCard
          step={3}
          title="SSL 인증서 발급"
          description="보안 연결을 위한 SSL 인증서를 자동으로 발급합니다."
          status={step3}
        >
          <div className="space-y-3">
            {domain.sslCertificate && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {domain.sslCertificate.status === 'active'
                        ? '✅ 인증서 발급 완료'
                        : '보안 인증서 발급 중...'}
                    </span>
                    <span className="font-mono text-xs text-gray-400">
                      {domain.sslCertificate.progress}%
                    </span>
                  </div>
                  <ProgressBar progress={domain.sslCertificate.progress} />
                </div>

                {domain.sslCertificate.status === 'active' &&
                  domain.sslCertificate.expiresAt && (
                    <p className="text-xs text-gray-500">
                      만료일:{' '}
                      {domain.sslCertificate.expiresAt.toLocaleDateString('ko-KR')}
                    </p>
                  )}
              </>
            )}
          </div>
        </StepCard>
      </div>

      {/* ── 완료 배너 ────────────────────────────────────────── */}
      {domain.status === DomainStatus.ACTIVE && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 text-center"
        >
          <p className="text-lg font-bold text-green-800">🎉 도메인 연결 완료!</p>
          <p className="mt-1 text-sm text-green-600">
            <span className="font-mono font-semibold">{domain.domain}</span>이(가)
            성공적으로 연결되었습니다.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
