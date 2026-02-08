// types/domain.ts

export enum DomainStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  CNAME_PENDING = 'CNAME_PENDING',
  SSL_PROVISIONING = 'SSL_PROVISIONING',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR',
}

export interface TxtRecord {
  host: string;
  value: string;
  verified: boolean;
}

export interface CnameRecord {
  host: string;
  target: string;
  verified: boolean;
}

export interface SslCertificate {
  status: 'provisioning' | 'active' | 'error';
  progress: number; // 0~100
  expiresAt: Date | null;
}

export interface CustomDomain {
  id: string;
  domain: string;
  verificationToken: string;
  status: DomainStatus;
  txtRecord: TxtRecord;
  cnameRecord: CnameRecord;
  sslCertificate: SslCertificate | null;
  createdAt: Date;
}
