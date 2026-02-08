// api/mock-api.ts
// Magic Domain 기반 시뮬레이션 API 레이어

import { CustomDomain, DomainStatus } from '@/types/domain';

// ── helpers ───────────────────────────────────────────────────
function generateId(): string {
  return `dom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateToken(): string {
  return `verify-token-${Math.random().toString(36).slice(2, 10)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 1.5초 ~ 3초 사이 랜덤 지연 */
function randomDelay(): Promise<void> {
  return delay(1500 + Math.random() * 1500);
}

// ── API: 도메인 등록 ──────────────────────────────────────────
export async function registerDomain(domain: string): Promise<CustomDomain> {
  await randomDelay();

  // error.com → 즉시 500 에러
  if (domain === 'error.com') {
    throw new Error('Internal Server Error: 시스템 에러가 발생했습니다.');
  }

  const token = generateToken();

  return {
    id: generateId(),
    domain,
    verificationToken: token,
    status: DomainStatus.PENDING_VERIFICATION,
    txtRecord: {
      host: '_verification',
      value: token,
      verified: false,
    },
    cnameRecord: {
      host: 'app',
      target: 'custom.our-service.com',
      verified: false,
    },
    sslCertificate: null,
    createdAt: new Date(),
  };
}

// ── API: TXT 레코드 검증 ─────────────────────────────────────
export async function verifyTxtRecord(
  domainData: CustomDomain
): Promise<CustomDomain> {
  await randomDelay();

  const { domain } = domainData;

  // fail-txt.com → TXT 검증 실패
  if (domain === 'fail-txt.com') {
    return {
      ...domainData,
      status: DomainStatus.ERROR,
      txtRecord: { ...domainData.txtRecord, verified: false },
    };
  }

  // 그 외 → TXT 검증 성공
  return {
    ...domainData,
    status: DomainStatus.VERIFIED,
    txtRecord: { ...domainData.txtRecord, verified: true },
  };
}

// ── API: CNAME 레코드 검증 ───────────────────────────────────
export async function verifyCnameRecord(
  domainData: CustomDomain
): Promise<CustomDomain> {
  await randomDelay();

  const { domain } = domainData;

  // fail-cname.com → CNAME 검증 실패
  if (domain === 'fail-cname.com') {
    return {
      ...domainData,
      status: DomainStatus.ERROR,
      cnameRecord: { ...domainData.cnameRecord, verified: false },
    };
  }

  // 그 외 → CNAME 검증 성공 → SSL 프로비저닝 시작
  return {
    ...domainData,
    status: DomainStatus.SSL_PROVISIONING,
    cnameRecord: { ...domainData.cnameRecord, verified: true },
    sslCertificate: {
      status: 'provisioning',
      progress: 0,
      expiresAt: null,
    },
  };
}

// ── API: SSL 프로비저닝 진행 ─────────────────────────────────
export async function pollSslStatus(
  domainData: CustomDomain
): Promise<CustomDomain> {
  await delay(1000);

  const { domain } = domainData;
  const currentProgress = domainData.sslCertificate?.progress ?? 0;

  // ssl-hang.com → SSL이 영원히 provisioning
  if (domain === 'ssl-hang.com') {
    return {
      ...domainData,
      sslCertificate: {
        status: 'provisioning',
        progress: Math.min(currentProgress + 2, 60), // 60%에서 멈춤
        expiresAt: null,
      },
    };
  }

  // 일반 → progress 20씩 증가
  const nextProgress = Math.min(currentProgress + 20, 100);

  if (nextProgress >= 100) {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);

    return {
      ...domainData,
      status: DomainStatus.ACTIVE,
      sslCertificate: {
        status: 'active',
        progress: 100,
        expiresAt: expires,
      },
    };
  }

  return {
    ...domainData,
    sslCertificate: {
      status: 'provisioning',
      progress: nextProgress,
      expiresAt: null,
    },
  };
}

// ── API: 도메인 삭제 ──────────────────────────────────────────
export async function deleteDomain(): Promise<void> {
  await delay(800);
}
