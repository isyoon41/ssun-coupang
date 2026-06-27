# RG Agent

쿠팡 로켓그로스(RocketGrowth) 1인 셀러를 위한 **Human-in-the-loop AI 등록 보조 웹앱**입니다.
상품 링크/이미지 설명/텍스트를 입력하면 AI(현재는 Mock Provider)가 상품 분석, 리스크 1차 점검,
SEO 상품명/검색어 태그 20개, 상세페이지 문구, 썸네일 콘셉트, 광고 카피, 가격·마진 계산,
로켓그로스 입고 체크리스트, 광고 전략, QA를 생성하고, 사용자가 검수·수정·승인한 산출물만 모아
쿠팡 WING에 직접 복붙·업로드할 수 있는 등록 패키지를 만들어 줍니다.

## 핵심 원칙 (반드시 지켜야 하는 제약)

- 쿠팡 WING 자동 로그인 / 자동 클릭 / 자동 등록 제출 / 자동 광고 집행을 구현하지 않습니다.
- AI는 법률 판단을 확정하지 않습니다. IP/상표/디자인/인증/표시광고 리스크는 항상 "1차 점검"으로만 표시됩니다.
- AI 산출물은 사용자가 승인(approve)해야만 최종 등록 패키지에 포함됩니다(`status: 'approved'`인 `AiOutput`만 집계).
- 가격 계산은 공급가/배송비/쿠팡 수수료/로켓그로스 비용/광고비/반품비/보관비를 분리해서 보여줍니다.
- 쿠팡 계정 ID/PW, 사업자/개인정보를 저장하지 않습니다.

## 기술 스택

- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS + 자체 구현한 shadcn/ui 스타일 컴포넌트 (`src/components/ui`)
- Prisma ORM — 로컬 개발 기본값은 **SQLite**(`prisma/schema.prisma`)이며, 운영 배포 시 `provider`를 `postgresql`로
  바꾸고 `DATABASE_URL`을 교체하면 됩니다. (스키마 자체는 PostgreSQL과 호환되도록 설계했습니다.)
- AI Provider 추상화 — 기본은 `MockAiProvider`(규칙 기반, API 키 불필요)이며, `src/lib/ai/provider.ts`의
  `AiProvider` 인터페이스를 구현하면 OpenAI/Anthropic 등 실제 LLM Provider로 교체할 수 있습니다
  (`src/lib/ai/mock-provider.ts`의 TODO 참고).

## 로컬 개발 환경 구성

```bash
cd rg-agent
cp .env.example .env
npm install
npx prisma db push      # SQLite DB 생성 (dev.db)
npx prisma db seed      # 샘플 프로젝트 2개 시드 (선택)
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속합니다.

### ⚠️ 샌드박스/오프라인 환경에서의 알려진 제약

이 환경(에이전트 빌드 샌드박스)에서는 `prisma generate`/`npm install` 과정에서 Prisma 엔진 바이너리를
`binaries.prisma.sh`에서 내려받는 과정이 네트워크 정책에 의해 차단되어(`ECONNRESET`) Prisma Client가
생성되지 않았습니다. 이로 인해 이 환경에서는 `npm run build`와 전체 `tsc` 타입 체크를 끝까지 통과시키지
못했습니다(`@prisma/client`의 `PrismaClient`/`Prisma` export가 비어 있어 발생하는 타입 오류만 존재하며,
실제 네트워크가 열린 개발 환경에서 `npx prisma generate`(또는 `npm install`)를 정상적으로 실행하면
모두 해소됩니다). 일반 개발 머신/CI에서는 네트워크 제약이 없으므로 위 설치 순서를 그대로 따르면 됩니다.

## 디렉터리 구조

```
rg-agent/
  app/                     Next.js App Router (페이지 + API 라우트)
    api/                   REST API (projects, outputs, pricing, checklists, listing-packages 등)
    projects/              프로젝트 목록/생성/상세 페이지
    approvals/             검수·승인 대기 목록
    listing-packages/      생성된 등록 패키지 목록
    settings/              설정/고지 페이지
  src/
    types/                 domain.ts(도메인 타입), api.ts(API 응답 envelope)
    lib/
      ai/                   AiProvider 인터페이스, MockAiProvider, 11개 Agent 래퍼, 오케스트레이터
      pricing/               가격·마진 계산기(결정론적 공식, LLM 미사용)
      packages/              Markdown/HTML/CSV 패키지 빌더
      prisma.ts              PrismaClient 싱글톤
      utils.ts               cn/formatKrw/formatPercent/safeJsonParse
    components/
      ui/                    버튼/카드/배지/입력/다이얼로그 등 재사용 UI 프리미티브
      layout/                Sidebar/Header/AppShell
      domain/                프로젝트 상태 배지, 리스크 패널, SEO 태그 에디터, 가격 계산 폼,
                              체크리스트 패널, 등록 패키지 프리뷰 등 도메인 컴포넌트
  prisma/
    schema.prisma            DB 스키마 (User/ProductProject/AiOutput/PricingOutput/Checklist/Approval/ListingPackage)
    seed.ts                  샘플 데이터 시드 스크립트
```

## Human-in-the-loop 워크플로

1. `/projects/new`에서 새 프로젝트 생성 (URL, 이미지 설명, 텍스트 중 최소 1개 입력)
2. 프로젝트 상세 페이지에서 "AI 분석 실행" → 11개 Agent가 순차 실행되어 `AiOutput`(상태: `draft`)과
   `PricingOutput`, `Checklist`를 생성
3. 각 탭에서 산출물을 검수하고 승인(approve) / 수정 요청(request-revision) / 반려(reject)
4. 승인된 산출물이 1개 이상 있으면 "등록 패키지 생성" 클릭 → 승인된 항목만 모아
   Markdown/HTML/CSV/JSON 형식의 등록 패키지 생성 (`/api/listing-packages/:id/download?format=...`)
5. 생성된 패키지를 직접 쿠팡 WING에 복붙/업로드 (자동 등록 없음)

## 향후 확장 포인트 (TODO로 코드에 표시되어 있음)

- 실제 LLM Provider(OpenAI/Anthropic) 연동: `src/lib/ai/mock-provider.ts`, `src/lib/ai/provider.ts`
- DOCX/PDF/XLSX 내보내기: `src/lib/packages/`에 빌더 추가
- 인증/멀티유저: 현재 `ProductProject.userId`는 optional이며 인증 미구현
- 비동기 큐 기반 AI 분석 실행: `app/api/projects/[id]/analyze/route.ts`는 현재 동기 실행
