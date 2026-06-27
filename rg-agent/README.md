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
- Prisma ORM — **PostgreSQL** 고정(`prisma/schema.prisma`). Vercel Postgres(Neon 기반) 또는 임의의
  Postgres 인스턴스를 `DATABASE_URL`로 연결해 사용합니다.
- AI Provider 추상화 — 기본은 `MockAiProvider`(규칙 기반, API 키 불필요)이며, `src/lib/ai/provider.ts`의
  `AiProvider` 인터페이스를 구현하면 OpenAI/Anthropic 등 실제 LLM Provider로 교체할 수 있습니다
  (`src/lib/ai/mock-provider.ts`의 TODO 참고).

## 로컬 개발 환경 구성

로컬에서도 Postgres가 필요합니다(Vercel Postgres를 만들어 그 `DATABASE_URL`을 그대로 써도 되고,
로컬/Docker Postgres를 따로 띄워도 됩니다).

```bash
cd rg-agent
cp .env.example .env    # DATABASE_URL을 실제 Postgres 접속 문자열로 채울 것
npm install
npx prisma migrate dev --name init   # 최초 1회: 마이그레이션 생성 + 적용
npx tsx prisma/seed.ts               # 샘플 프로젝트 2개 시드 (선택)
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속합니다.

### 검증 완료

SQLite 기준으로 다음 골든패스를 실제로 end-to-end 확인했습니다: 프로젝트 생성 → AI 분석 실행(11개
Agent) → 산출물 승인 → 등록 패키지 생성 → Markdown/HTML/CSV/JSON 4종 다운로드. `npx tsc --noEmit`도
에러 없이 통과합니다. 이후 Vercel 배포를 위해 datasource provider를 `postgresql`로 전환했으며,
모든 상태/타입 필드는 Prisma `enum` 대신 `String` + `src/types/domain.ts`의 TypeScript union 타입으로
검증됩니다(SQLite는 enum을 지원하지 않아 처음부터 이 방식으로 설계했고, Postgres에서도 동일하게 동작
합니다).

## Vercel 배포

1. https://vercel.com/isyoon41s-projects 에서 이 GitHub 저장소를 Import (Root Directory를
   `rg-agent`로 지정)
2. 프로젝트의 **Storage** 탭에서 Postgres(Vercel Postgres / Neon)를 생성하고 프로젝트에 연결하면
   `DATABASE_URL`이 환경변수로 자동 주입됩니다.
3. 같은 환경변수 설정 화면에서 `AI_PROVIDER=mock`, `NEXT_PUBLIC_APP_NAME` 등 `.env.example`의
   나머지 값도 채워 넣습니다.
4. 최초 배포 전, 로컬에서 위 `DATABASE_URL`(Vercel Postgres 접속 문자열)을 사용해
   `npx prisma migrate dev --name init`을 한 번 실행하고 생성된 `prisma/migrations/` 폴더를
   커밋·푸시합니다. (Vercel 빌드는 `npm run build` 안에 포함된 `prisma generate`만 실행하며, 스키마를
   실제 DB에 적용하는 `prisma migrate deploy`는 별도로 실행해야 합니다 — Vercel의 Deploy Hooks나
   로컬에서 1회 실행으로 처리하면 됩니다.)
5. Deploy 클릭 → 배포 완료 후 동일한 골든패스(프로젝트 생성 → AI 분석 → 승인 → 패키지 생성/다운로드)를
   운영 URL에서 다시 한번 확인합니다.

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
