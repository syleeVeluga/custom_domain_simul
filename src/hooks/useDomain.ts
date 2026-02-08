// hooks/useDomain.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { CustomDomain, DomainStatus } from '@/types/domain';
import {
  registerDomain,
  verifyTxtRecord,
  verifyCnameRecord,
  pollSslStatus,
  deleteDomain,
} from '@/api/mock-api';

interface UseDomainReturn {
  domain: CustomDomain | null;
  loading: boolean;
  error: string | null;
  /** Mode A → 도메인 등록 */
  register: (domainName: string) => Promise<boolean>;
  /** Step 1 → TXT 검증 */
  verifyTxt: () => Promise<void>;
  /** Step 2 → CNAME 검증 */
  verifyCname: () => Promise<void>;
  /** 연결 해제 */
  disconnect: () => Promise<void>;
}

export function useDomain(): UseDomainReturn {
  const [domain, setDomain] = useState<CustomDomain | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sslTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // SSL 폴링 정리
  const clearSslPolling = useCallback(() => {
    if (sslTimerRef.current) {
      clearInterval(sslTimerRef.current);
      sslTimerRef.current = null;
    }
  }, []);

  // SSL 폴링 시작
  const startSslPolling = useCallback(
    (initialData: CustomDomain) => {
      clearSslPolling();
      let currentData = initialData;

      sslTimerRef.current = setInterval(async () => {
        try {
          const updated = await pollSslStatus(currentData);
          currentData = updated;
          setDomain(updated);

          if (updated.status === DomainStatus.ACTIVE) {
            clearSslPolling();
          }
        } catch {
          clearSslPolling();
        }
      }, 1500);
    },
    [clearSslPolling]
  );

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => clearSslPolling();
  }, [clearSslPolling]);

  // ── register ───────────────────────────────────────────────
  const register = useCallback(
    async (domainName: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const result = await registerDomain(domainName);
        setDomain(result);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ── verifyTxt ──────────────────────────────────────────────
  const verifyTxt = useCallback(async () => {
    if (!domain) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await verifyTxtRecord(domain);
      setDomain(updated);
      if (updated.status === DomainStatus.ERROR) {
        setError('TXT 레코드를 찾을 수 없습니다. DNS 설정을 확인해주세요.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '검증 중 오류 발생');
    } finally {
      setLoading(false);
    }
  }, [domain]);

  // ── verifyCname ────────────────────────────────────────────
  const verifyCname = useCallback(async () => {
    if (!domain) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await verifyCnameRecord(domain);
      setDomain(updated);

      if (updated.status === DomainStatus.ERROR) {
        setError('CNAME 레코드 연결을 확인할 수 없습니다.');
      } else if (updated.status === DomainStatus.SSL_PROVISIONING) {
        startSslPolling(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '검증 중 오류 발생');
    } finally {
      setLoading(false);
    }
  }, [domain, startSslPolling]);

  // ── disconnect ─────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    setLoading(true);
    clearSslPolling();
    try {
      await deleteDomain();
      setDomain(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [clearSslPolling]);

  return {
    domain,
    loading,
    error,
    register,
    verifyTxt,
    verifyCname,
    disconnect,
  };
}
