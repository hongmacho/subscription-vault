# SubscriptionVault - Development Roadmap

## Sprint Structure Overview

- **Total Duration**: 5-6주 (Sprint 0 포함)
- **Sprint Length**: 1주일 (5일)
- **마일스톤**: Sprint 0 셋업 → Sprint 1~4 핵심 기능 → Sprint 5 마무리 & 폴리시

---

## Sprint 0: 프로젝트 초기화 (1주일)

**목표**: Next.js 16 프로젝트 셋업, 의존성 설치, 개발 환경 구성

### 작업 목록

- [ ] **Next.js 프로젝트 생성**
  - 명령어: `npx create-next-app@latest subscription-vault --yes`
  - App Router 확인 (default)
  - TypeScript 확인 (default)
  - ESLint 확인 (default, `eslint.config.mjs` 자동 생성)
  - Tailwind CSS v4 확인 (default, `@tailwindcss/postcss`)
  - Import alias `@/*` 확인

- [ ] **shadcn/ui 초기화**
  - 명령어: `npx shadcn@latest init -d` (defaults 모드)
  - React 19 peer dependency 확인
  - Base 또는 Radix 선택 (권장: Radix)
  - 필요 컴포넌트 사전 설치:
    - `npx shadcn-ui@latest add button input select dialog form table card chart`
    - 추가 (차트): `npx shadcn-ui@latest add pie-chart line-chart bar-chart`

- [ ] **Drizzle ORM + SQLite 셋업**
  - 설치: `npm install drizzle-orm better-sqlite3 -D drizzle-kit @types/better-sqlite3`
  - 파일 생성:
    - `src/db/schema.ts` (Drizzle 스키마 정의)
    - `drizzle.config.ts` (Drizzle 설정)
    - `src/db/db.ts` (SQLite 연결 인스턴스)
  - 초기 DB 생성: `npx drizzle-kit push`

- [ ] **프로젝트 구조 생성**
  ```
  src/
    app/
      (layout)/
        page.tsx          # 대시보드
        subscriptions/
          page.tsx        # 구독 목록
          [id]/
            page.tsx      # 구독 상세
        analytics/
          page.tsx        # 통계
        settings/
          page.tsx        # 설정
      layout.tsx
    components/
      ui/               # shadcn/ui 컴포넌트
      features/         # 기능 컴포넌트 (DashboardCard, SubscriptionForm 등)
    db/
      schema.ts         # Drizzle ORM 스키마
      db.ts             # DB 인스턴스
    lib/
      utils.ts          # 유틸 함수
    types/
      index.ts          # TS 타입 정의
  public/
  ```

- [ ] **ESLint & 개발 설정**
  - `eslint.config.mjs` 직접 구성 (create-next-app 기본값 사용, `next lint` 제거됨)
  - `.prettierrc` 생성 (선택)
  - `.gitignore` 업데이트 (SQLite 제외: `*.db`)

- [ ] **README & 개발 문서**
  - `README.md`: 프로젝트 개요, 설치 & 실행 방법
  - `SETUP.md`: 환경 변수, DB 마이그레이션 가이드

### 완료 기준

- [ ] `npm run dev` 실행 시 에러 없음
- [ ] `http://localhost:3000` 접속 가능
- [ ] SQLite 파일 생성됨 (`./sqlite.db` 또는 설정된 경로)
- [ ] shadcn/ui 컴포넌트 import 가능 (`@/components/ui/*`)
- [ ] ESLint 체크 통과: `npx eslint .`

---

## Sprint 1: DB 스키마 & Repository 레이어 (1주일)

**목표**: Drizzle ORM 스키마 정의, Repository 패턴 구현, 데이터 조작 로직 테스트

### 작업 목록

- [ ] **Drizzle 스키마 정의**
  - 파일: `src/db/schema.ts`
  - 테이블:
    - `subscriptions` (id, name, category, monthlyPrice, billingDayOfMonth, contractStartDate, contractType, isActive, notes, createdAt, updatedAt)
    - `priceHistory` (id, subscriptionId FK, previousPrice, newPrice, changeDate, changeReason, createdAt)
    - `alternativeServices` (id, subscriptionId FK, serviceName, monthlyPrice, notes, createdAt)

  **기술 주의사항**:
  - 정수 타임스탬프 사용 (밀리초): `timestamp().defaultNow()` → Drizzle에서 `sql<number>`로 캐스팅
  - `billingDayOfMonth` 검증: 1~31 범위
  - `contractStartDate`는 `date()` 타입 (YYYY-MM-DD)
  - Drizzle 0.31.5 최신 문법 사용

- [ ] **Repository 레이어 구현**
  - 파일: `src/db/repositories/`
  - 클래스:
    - `SubscriptionRepository` (CRUD, 필터, 검색)
    - `PriceHistoryRepository` (기록 추가, 조회)
    - `AlternativeServiceRepository` (추천 서비스 CRUD)

  ```typescript
  // 예: SubscriptionRepository
  class SubscriptionRepository {
    async create(data): Promise<Subscription>
    async findById(id: number): Promise<Subscription | null>
    async findAll(): Promise<Subscription[]>
    async findByCategory(category: string): Promise<Subscription[]>
    async search(query: string): Promise<Subscription[]>  // 서비스명 검색
    async update(id, data): Promise<Subscription>
    async delete(id: number): Promise<boolean>
  }
  ```

  **기술 주의사항**:
  - `BetterSQLite3Database<typeof schema>` 제네릭 타입 사용
  - Drizzle의 `eq()`, `like()`, `and()` 필터 함수 활용
  - 트랜잭션 지원 (구독 + 가격 이력 동시 저장 시)

- [ ] **타입 정의**
  - 파일: `src/types/index.ts`
  - 인터페이스: `Subscription`, `PriceHistory`, `AlternativeService`
  - Enum: `SubscriptionCategory`, `ContractType`

- [ ] **유틸 함수**
  - 파일: `src/lib/utils.ts`
  - 함수:
    - `calculateMonthlyForecast()` - 다음 N개월 비용 예측
    - `calculateCancellationDate()` - 취소 가능 날짜 계산
    - `formatKRW()` - 한국어 원 단위 포맷
    - `getCategoryColor()` - 카테고리별 색상

- [ ] **단위 테스트**
  - 프레임워크: Vitest 또는 Jest
  - 파일: `src/db/repositories/*.test.ts`
  - 테스트:
    - Repository CRUD 메서드
    - 계산 유틸 함수 (월별 예상 비용, 취소 가능일)
    - 필터/검색 기능

### 완료 기준

- [ ] Drizzle 마이그레이션 적용 완료 (테이블 생성)
- [ ] Repository 메서드 구현 100% (모든 메서드)
- [ ] 단위 테스트 통과율 80% 이상
- [ ] TypeScript 타입 에러 0개
- [ ] Console에 SQL 로그 출력 확인 (development 모드)

---

## Sprint 2: 핵심 기능 Part 1 - CRUD & 대시보드 (1주일)

**목표**: 구독 추가/수정/삭제, 대시보드 기본 화면 구현

### 작업 목록

- [ ] **구독 추가 폼 컴포넌트**
  - 파일: `src/components/features/SubscriptionForm.tsx`
  - 필드: 서비스명, 월간 비용, 결제일, 카테고리, 계약 시작일, 계약 유형, 활성 여부, 메모
  - shadcn/ui 폼 라이브러리 사용 (`react-hook-form` + `zod` 검증)
  - 유효성 검사: 비용 > 0, 결제일 1~31, 날짜 형식
  - 제출 시 `SubscriptionRepository.create()` 또는 `.update()` 호출

- [ ] **구독 목록 페이지**
  - 파일: `src/app/(layout)/subscriptions/page.tsx`
  - 테이블 뷰 (shadcn Table 컴포넌트):
    - 컬럼: 서비스명, 카테고리, 월간 비용, 결제일, 활성 상태
    - 행 클릭 → 상세 페이지 이동
  - 헤더: "구독 목록" + "+ 구독 추가" 버튼
  - 레이아웃: 사이드바 네비게이션 포함

- [ ] **구독 상세 페이지**
  - 파일: `src/app/(layout)/subscriptions/[id]/page.tsx`
  - 내용: 구독 정보 표시, 편집 버튼, 삭제 버튼
  - 편집 → `SubscriptionForm` 모달 표시
  - 삭제 → 확인 모달 후 `SubscriptionRepository.delete()` 호출
  - 하단: 가격 인상 이력 섹션 (Sprint 3에서 구현)

  **Next.js 16 주의**:
  - `await params` 사용 (동적 라우트): `const { id } = await params`

- [ ] **대시보드 (Overview) 페이지**
  - 파일: `src/app/(layout)/page.tsx`
  - 레이아웃:
    - 상단: 주요 지표 (4개 카드)
      - 총 구독 개수
      - 월간 평균 비용
      - 이번 달 예상 비용
      - 지난 달 대비 변화
    - 하단: 최근 구독 (테이블, 상위 5개)

  - 데이터 조회: `SubscriptionRepository.findAll()` + 계산 유틸
  - 빈 상태: "구독 없음" 메시지 + CTA

- [ ] **상단 네비게이션 & 레이아웃**
  - 파일: `src/app/(layout)/layout.tsx`
  - 사이드바:
    - 로고 + 앱명
    - 네비 메뉴: 대시보드, 구독 목록, 통계, 설정
  - 상단바:
    - 현재 페이지 제목
    - (선택) 프로필/설정 드롭다운
  - shadcn/ui 사용

- [ ] **에러 & 로딩 상태**
  - 로딩: Skeleton 컴포넌트
  - 에러: 에러 바운더리 + "다시 시도" 버튼
  - 빈 상태: 커스텀 메시지

### 완료 기준

- [ ] 구독 추가 폼 UI 렌더링 + 저장 동작
- [ ] 구독 목록 페이지 테이블 표시 (DB 데이터 반영)
- [ ] 구독 상세 페이지 편집/삭제 동작
- [ ] 대시보드 주요 지표 계산 & 표시
- [ ] 네비게이션 모든 페이지 이동 가능
- [ ] 모바일 반응형 동작 확인 (375px 이상)

---

## Sprint 3: 핵심 기능 Part 2 - 추적 & 알림 (1주일)

**목표**: 가격 인상 이력, 취소 알림, 검색/필터 기능

### 작업 목록

- [ ] **가격 인상 이력 추적**
  - 파일: `src/components/features/PriceHistorySection.tsx`
  - 기능:
    - 구독 상세 페이지에 "가격 인상 이력" 섹션 추가
    - 타임라인 UI: 변경 날짜, 이전가격 → 새로운가격, 변경 이유
    - "+ 가격 변경 기록" 버튼 → 모달 폼
  - 폼 필드: 이전 가격, 새로운 가격, 변경 날짜, 변경 이유
  - 제출: `PriceHistoryRepository.create()`

- [ ] **취소 가능 시점 계산 & 표시**
  - 파일: `src/lib/utils.ts` 함수 추가
  - 함수: `calculateCancellationDate(contractStartDate, contractType, currentDate)`
  - 로직:
    - Monthly: 시작일 기준 매월 같은 날
    - Annual: 시작일 기준 1년 후
    - One-time: 즉시 취소 불가
  - 구독 상세 페이지에 "취소 가능 일자" 배지 표시
  - 상태: 취소 가능 (초록색) / 대기 중 (회색) / 불가능 (빨강색)

- [ ] **검색 & 필터 기능**
  - 파일: `src/components/features/SubscriptionFilters.tsx`
  - 필터:
    - 서비스명 검색 (input field)
    - 카테고리 필터 (multi-select dropdown)
    - 비용 범위 (min/max input)
    - 활성/비활성 상태 (toggle)
  - 쿼리 파라미터 반영: `/subscriptions?search=Netflix&category=streaming&minPrice=10000`
  - 필터 초기화 버튼

- [ ] **구독 목록에 필터 통합**
  - 페이지: `src/app/(layout)/subscriptions/page.tsx` 수정
  - URL 쿼리 파라미터 읽기 (searchParams)
  - `SubscriptionRepository.search()` 호출
  - 결과 테이블 업데이트
  - 검색 결과 없음: 빈 상태 메시지

- [ ] **대체 서비스 추천 섹션 (수동 입력)**
  - 파일: `src/components/features/AlternativeServices.tsx`
  - 구독 상세 페이지에 추가
  - UI: 카드 리스트 (서비스명, 월간 가격, 메모)
  - 버튼: "+ 대체 서비스 추가"
  - 폼 필드: 서비스명, 월간 가격, 메모
  - 제출: `AlternativeServiceRepository.create()`

### 완료 기준

- [ ] 가격 인상 이력 타임라인 렌더링 & CRUD
- [ ] 취소 가능 날짜 자동 계산 & 표시 (정확도 검증)
- [ ] 검색 기능 동작 (서비스명 매칭)
- [ ] 다중 카테고리 필터 동작
- [ ] 비용 범위 필터 동작
- [ ] 빈 검색 결과 상태 메시지 표시

---

## Sprint 4: 시각화 & 통계 (1주일)

**목표**: Recharts 차트 구현, 통계/분석 페이지, CSV 내보내기

### 작업 목록

- [ ] **월별 예상 비용 계산 & 출력**
  - 파일: `src/lib/utils.ts` 함수
  - 함수: `generateMonthlyForecast(subscriptions, numMonths = 12)`
  - 로직:
    - 각 구독의 billingDayOfMonth 기준 월별 결제 시뮬레이션
    - 각 월의 총 비용 합산
    - 반환: `{ month: string, totalCost: number, count: number }[]`
  - 활성 구독만 포함

- [ ] **Recharts 차트 구현**
  - 파일: `src/components/features/SubscriptionCharts.tsx`
  - 차트:

    1. **월별 추세 라인 차트** (`<LineChart>`)
       - X축: 월 (과거 3개월 + 향후 9개월)
       - Y축: 월간 비용 (원)
       - 선: 파란색, 데이터포인트 표시
       - 호버: 상세값 표시 (예: "2024년 8월: 150,000원")

    2. **카테고리별 원형 차트** (`<PieChart>`)
       - 데이터: 현월 기준 카테고리별 합계
       - 색상: 카테고리별 고정 색상 (utility 함수)
       - 범례: 우측에 표시, 클릭 시 필터

    3. **월별 카테고리 스택 바 차트** (`<BarChart>`)
       - X축: 월
       - Y축: 월간 비용
       - 스택: 카테고리별 색상

- [ ] **통계 & 리포트 페이지**
  - 파일: `src/app/(layout)/analytics/page.tsx`
  - 레이아웃:
    - 상단: 통계 요약 (총 구독, 월간 평균, 최고 비용월, 절약 가능 금액)
    - 중단: 차트 3개 (라인, 원형, 스택 바)
    - 하단: CSV 내보내기 버튼

- [ ] **CSV 내보내기**
  - 파일: `src/lib/csv-export.ts`
  - 함수: `exportSubscriptionsToCSV(subscriptions, priceHistories)`
  - 포함 컬럼:
    - 서비스명, 카테고리, 월간 비용, 결제일, 계약 시작일, 계약 유형, 활성 상태
    - (추가) 최근 가격 인상, 취소 가능 날짜
  - 한국어 헤더
  - 파일명: `subscriptions_20240815.csv`
  - 버튼: 통계 페이지 하단 + 구독 목록 상단

- [ ] **월별 비용 변화 분석**
  - 통계 페이지에 추가 섹션
  - 지표: 월간 평균 비용, 최고 비용월, 최저 비용월, 월간 변동량
  - 트렌드: 상승/하강/안정 표시

### 완료 기준

- [ ] 월별 예상 비용 계산 함수 정확도 검증 (테스트)
- [ ] 라인 차트 렌더링 (Recharts 최적화, < 500ms)
- [ ] 원형 차트 범례 클릭 필터 동작
- [ ] 스택 바 차트 카테고리별 색상 정확
- [ ] CSV 다운로드 완료 & 엑셀 오픈 확인
- [ ] 통계 페이지 모든 지표 계산 정확

---

## Sprint 5: 마무리 & 폴리시 (1주일)

**목표**: 데이터 내보내기/가져오기, 설정 페이지, 접근성, 에러 처리, 테스트

### 작업 목록

- [ ] **설정 페이지**
  - 파일: `src/app/(layout)/settings/page.tsx`
  - 기능:
    - 기본 통화 설정 (선택, 초기값: KRW)
    - 데이터 내보내기 (JSON)
    - 데이터 가져오기 (JSON 파일 업로드)
    - DB 초기화 (전체 데이터 삭제, 경고 포함)

- [ ] **데이터 내보내기/가져오기**
  - 파일: `src/lib/data-io.ts`
  - 함수:
    - `exportDataAsJSON()` - 모든 데이터 JSON으로 변환
    - `importDataFromJSON(file)` - JSON 파일 읽어서 DB에 저장
  - 형식: `{ subscriptions: [], priceHistories: [], alternativeServices: [] }`

- [ ] **에러 처리 & 로깅**
  - try-catch 모든 DB 쿼리에 추가
  - 사용자 친화적 에러 메시지
  - 콘솔 로깅 (개발 모드만)
  - 에러 바운더리 컴포넌트

- [ ] **접근성 개선**
  - 모든 폼 필드에 `aria-label` 추가
  - 테이블에 `aria-sort` 속성
  - 버튼에 `aria-pressed` (토글), `aria-expanded` (드롭다운)
  - 색상만으로 정보 전달 금지 (텍스트 라벨 병행)
  - 키보드 네비게이션: Tab, Enter, Escape 지원
  - 포커스 표시 (outline)

- [ ] **모바일 반응형 최적화**
  - 브레이크포인트: 375px (모바일), 768px (태블릿), 1024px (데스크톱)
  - 모바일에서 테이블 → 카드 뷰 변경
  - 차트 리사이징
  - 터치 타겟 최소 48px

- [ ] **통합 테스트**
  - 프레임워크: Vitest + Playwright (E2E)
  - 테스트 시나리오:
    1. 구독 추가 → 목록에서 확인
    2. 가격 인상 기록 → 이력 타임라인에 표시
    3. 검색 & 필터 → 결과 정확
    4. CSV 내보내기 → 파일 다운로드 & 내용 검증
    5. 통계 차트 → 렌더링 완료 & 데이터 정확
  - 커버리지: 80% 이상

- [ ] **문서 및 배포 준비**
  - `README.md` 업데이트 (기능 목록, 스크린샷)
  - `CONTRIBUTING.md` (개발 가이드)
  - 변경 로그 (`CHANGELOG.md`)
  - `.env.example` (필요시)

### 완료 기준

- [ ] 설정 페이지 모든 기능 동작
- [ ] 데이터 내보내기 & 가져오기 순환 검증 (export → import → 데이터 동일)
- [ ] WCAG 2.1 AA 준수 (색상 대비, 키보드, 스크린리더)
- [ ] 모바일 375px 이상에서 레이아웃 정상
- [ ] 통합 테스트 통과율 80% 이상
- [ ] 빌드 에러 0개, TypeScript 타입 에러 0개
- [ ] `npm run build` 성공

---

## 기술 주의사항 (Technical Notes)

### Next.js 16 특이사항

1. **Dynamic Route Parameters**
   - 동적 라우트에서 `params` 사용 시 반드시 `await` 필수
   - 예: `const { id } = await params`
   - 이유: Next.js 16에서 params가 Promise 반환

2. **searchParams (URL Query String)**
   - Server Component에서 직접 접근 가능
   - 예: `async ({ searchParams }: { searchParams: Promise<Record<string, string>> })`
   - await 필요할 수 있음 (16 버전 확인)

3. **ESLint 변경**
   - `create-next-app --yes`는 `eslint.config.mjs` 생성
   - `next lint` 명령어 제거됨 (ESLint 9 호환)
   - 대신 `eslint .` 직접 실행

### Drizzle ORM 0.31.5 패턴

1. **Integer Timestamp**
   ```typescript
   export const subscriptions = sqliteTable('subscriptions', {
     createdAt: integer('created_at', { mode: 'timestamp_ms' }).defaultNow(),
     // 또는
     createdAt: integer('created_at').default(() => Date.now()),
   });
   ```

2. **타입 제네릭**
   ```typescript
   type DB = BetterSQLite3Database<typeof schema>;
   
   class SubscriptionRepository {
     constructor(private db: DB) {}
   }
   ```

3. **SQL 캐스팅**
   ```typescript
   // 집계 함수에서 명시적 캐스팅
   import { sql } from 'drizzle-orm';
   
   db.select({ total: sql<number>`sum(${subscriptions.monthlyPrice})` })
   ```

4. **Transaction 지원**
   ```typescript
   db.transaction((tx) => {
     tx.insert(subscriptions).values(...);
     tx.insert(priceHistory).values(...);
   });
   ```

### better-sqlite3 고려사항

1. **동기 API** (async/await 불필요)
   ```typescript
   const db = new Database('sqlite.db');
   const result = db.prepare('SELECT * FROM subscriptions').all();
   // 즉시 결과 반환 (Promise 없음)
   ```

2. **WAL 모드 (성능)**
   ```typescript
   db.pragma('journal_mode = WAL');
   ```

3. **Node.js 버전**: 18.0.0 이상 필수

### Tailwind CSS v4 특이사항

1. **CSS 임포트**
   ```css
   /* global.css */
   @import 'tailwindcss';
   ```
   - `@tailwind` 지시어 필요 없음 (자동)
   - Template 경로 자동 스캔 (설정 불필요)

2. **Custom Colors**
   ```css
   @theme {
     --color-primary: #3b82f6;
     --color-success: #10b981;
   }
   ```

### shadcn/ui 2.9.0 컴포넌트 사용

1. **Form 라이브러리**
   - `react-hook-form` + `zod` 기반
   - 예: `<FormField>`, `<FormItem>`, `<FormMessage>`

2. **Chart 컴포넌트**
   - Recharts 내장
   - 예: `<LineChart>`, `<PieChart>`, `<BarChart>`

3. **Dialog & Modal**
   - Radix UI 기반 (자동 포커스 관리, ESC 닫기 등)

### 데이터 모델 - Drizzle 정의 예

```typescript
import { sqliteTable, integer, text, real, boolean } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // enum 문자열
  monthlyPrice: integer('monthly_price').notNull(), // 원 단위 정수
  billingDayOfMonth: integer('billing_day_of_month').notNull(),
  contractStartDate: text('contract_start_date').notNull(), // YYYY-MM-DD
  contractType: text('contract_type').notNull(), // 'monthly', 'annual', 'one_time'
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).defaultNow(),
});

export const priceHistories = sqliteTable('price_histories', {
  id: integer('id').primaryKey(),
  subscriptionId: integer('subscription_id').notNull().references(() => subscriptions.id),
  previousPrice: integer('previous_price').notNull(),
  newPrice: integer('new_price').notNull(),
  changeDate: text('change_date').notNull(),
  changeReason: text('change_reason'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).defaultNow(),
});

// Relations
export const subscriptionsRelations = relations(subscriptions, ({ many }) => ({
  priceHistories: many(priceHistories),
}));
```

---

## 병렬 개발 전략

- **Sprint 1**: 1명 (DB 스키마 + Repository)
- **Sprint 2~3**: 2명 (기능 개발 분담 가능)
  - 팀원 A: CRUD 화면 (구독 추가/수정/삭제)
  - 팀원 B: 대시보드 + 추적 기능
- **Sprint 4~5**: 1명 + 테스트 (시각화 + 마무리)

---

## 성공 지표

| Sprint | 목표 | 검증 |
|--------|------|------|
| 0 | 개발 환경 완성 | `npm run dev` 실행 & localhost:3000 접속 |
| 1 | DB + Repository 완성 | 테스트 통과 80% 이상 |
| 2 | CRUD + 대시보드 | UI 렌더링 + 데이터 조회/저장 동작 |
| 3 | 추적 + 검색 | 가격 이력/취소 알림/필터 동작 |
| 4 | 차트 + 통계 | Recharts 렌더링 + CSV 내보내기 |
| 5 | 마무리 | 테스트 80% + 접근성 AA + 빌드 성공 |
