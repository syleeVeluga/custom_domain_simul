# **PRD: Custom Domain Connection (Simulation Ready)**

**Version:** 2.0 (Final Consolidated)

**Date:** 2026-02-09

**Target:** Phase 1 (Custom Domain) with Full Mocking System

**Tech Stack:** React (TypeScript), Node.js, Tailwind CSS, Shadcn/UI, Framer Motion

## **1\. Executive Summary**

본 프로젝트는 SaaS 고객이 자신의 도메인(예: app.customer.com)을 서비스에 연결하는 기능을 구현합니다.

**핵심 목표는 실제 DNS/SSL 인프라 연동 없이도, 도메인 검증부터 SSL 발급까지의 전체 UX 흐름을 시연하고 검증할 수 있는 '시뮬레이션 모드'를 구축하는 것입니다.**

## **2\. User Experience (UX) Flow**

화면은 도메인 등록 여부에 따라 두 가지 모드(Mode A, Mode B)로 자동 전환됩니다.

### **2.1. Mode A: Zero Data State (초기 진입)**

사용자가 처음 방문했을 때 보여지는 화면입니다. 복잡한 설정 대신 가치 제안과 즉각적인 행동을 유도합니다.

* **Layout:** 화면 중앙 정렬 (Hero Section 스타일).  
* **Components:**  
  * **Headline:** "나만의 도메인으로 브랜딩을 강화하세요."  
  * **Input Field:** 대형 입력창 (Placeholder: app.yourcompany.com).  
  * **Action Button:** "도메인 연결 시작하기" (CTA).  
  * **Interaction:**  
    * 도메인 입력 후 엔터/클릭 시 POST /api/domains 호출.  
    * 성공 시 부드러운 애니메이션(Framer Motion)과 함께 **Mode B**로 전환.  
    * error.com 입력 시 전환 없이 입력창이 흔들리는(Shake) 애니메이션 및 에러 토스트 출력.

### **2.2. Mode B: Dashboard State (진행 및 관리)**

도메인이 등록된 후 상태를 모니터링하고 설정을 진행하는 대시보드 화면입니다.

* **Layout:** 상단 요약 정보 \+ 하단 단계별 설정 가이드.  
* **Components:**  
  * **Status Header:** 도메인 이름, 현재 상태 배지(Pending/Active/Error), '연결 해제' 버튼.  
  * **Step 1: TXT Verification:**  
    * DNS 설정에 필요한 Host(\_verification)와 Value(토큰) 표시.  
    * '복사' 버튼 및 '검증 확인' 버튼.  
  * **Step 2: CNAME Configuration:**  
    * TXT 검증 완료 시 활성화.  
    * CNAME Host(app)와 Target(custom.our-service.com) 표시.  
  * **Step 3: SSL Provisioning:**  
    * CNAME 검증 완료 시 자동 시작.  
    * 진행률 표시줄(Progress Bar) 및 실시간 상태 메시지("보안 인증서 발급 중...").

## **3\. Simulation & Mocking Strategy**

실제 DNS 조회 대신, 입력된 \*\*도메인 이름(Magic Domain)\*\*에 따라 정해진 시나리오를 수행합니다.

### **3.1. Magic Domain Rules**

모든 API 응답은 setTimeout을 사용하여 네트워크 지연(1.5초\~3초)을 시뮬레이션해야 합니다.

| 입력 도메인 | 시나리오 | 동작 설명 |
| :---- | :---- | :---- |
| **success.com** | **Happy Path** | 모든 검증(TXT, CNAME, SSL)이 한 번에 통과됨. |
| **fail-txt.com** | **TXT 실패** | TXT 검증 단계에서 "레코드를 찾을 수 없습니다" 에러 반환. |
| **fail-cname.com** | **CNAME 실패** | TXT는 통과하지만, CNAME 연결 확인에서 실패. |
| **ssl-hang.com** | **SSL 지연** | 검증은 통과하지만, SSL 상태가 영원히 'Provisioning'에서 멈춤. |
| **error.com** | **시스템 에러** | 도메인 등록 시도 시 즉시 500 에러 발생 (Mode A 유지). |
| *(그 외)* | **기본 동작** | success.com과 동일하게 동작하되, 약간의 랜덤 지연 시간 부여. |

## **4\. Data Model (TypeScript Interface)**

// types/domain.ts

export enum DomainStatus {  
  PENDING\_VERIFICATION \= 'PENDING\_VERIFICATION', // 초기 상태  
  VERIFIED \= 'VERIFIED',                         // TXT 검증 완료  
  CNAME\_PENDING \= 'CNAME\_PENDING',               // CNAME 대기  
  SSL\_PROVISIONING \= 'SSL\_PROVISIONING',         // SSL 발급 중  
  ACTIVE \= 'ACTIVE',                             // 최종 완료  
  ERROR \= 'ERROR'  
}

export interface CustomDomain {  
  id: string;  
  domain: string;         // e.g., "success.com"  
  verificationToken: string; // e.g., "verify-token-12345"  
  status: DomainStatus;  
    
  // Records  
  txtRecord: { host: string; value: string; verified: boolean };  
  cnameRecord: { host: string; target: string; verified: boolean };  
    
  // SSL  
  sslCertificate: {  
    status: 'provisioning' | 'active' | 'error';  
    expiresAt: Date | null;  
  } | null;

  createdAt: Date;  
}  
