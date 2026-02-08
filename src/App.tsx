// App.tsx
import { AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { useDomain } from '@/hooks/useDomain';
import { ModeA } from '@/components/ModeA';
import { ModeB } from '@/components/ModeB';

export default function App() {
  const {
    domain,
    loading,
    error,
    register,
    verifyTxt,
    verifyCname,
    disconnect,
  } = useDomain();

  const handleRegister = async (domainName: string): Promise<boolean> => {
    const result = await register(domainName);
    if (result) {
      toast.success(`${domainName} 도메인이 등록되었습니다.`);
    } else {
      toast.error('도메인 등록에 실패했습니다.');
    }
    return result;
  };

  const handleDisconnect = async () => {
    await disconnect();
    toast.info('도메인 연결이 해제되었습니다.');
  };

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" richColors closeButton />

      <AnimatePresence mode="wait">
        {domain === null ? (
          <ModeA
            key="mode-a"
            loading={loading}
            error={error}
            onRegister={handleRegister}
          />
        ) : (
          <ModeB
            key="mode-b"
            domain={domain}
            loading={loading}
            error={error}
            onVerifyTxt={verifyTxt}
            onVerifyCname={verifyCname}
            onDisconnect={handleDisconnect}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
