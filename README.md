# SubscriptionVault

개인의 모든 구독 서비스를 한곳에서 관리하는 로컬-우선 구독료 관리 웹앱입니다.

## 🎯 서비스 소개

**SubscriptionVault**는 구독료 추적에만 집중하는 전문화된 플랫폼입니다.

### 핵심 가치
- 🏠 **완전 로컬 저장**: 모든 데이터를 사용자의 SQLite 데이터베이스에 저장
- 💰 **구독 특화 설계**: 가계부가 아닌 구독료 관리에만 집중
- 📊 **월별 예상 비용**: 다음 3개월 구독료를 자동 예측
- 📈 **가격 인상 추적**: 구독료 변경 이력 관리
- ⏰ **취소 시점 안내**: 계약 기간을 기준으로 취소 가능 날짜 자동 계산

## 📋 주요 기능

### Must-Have 기능 (8개)

1. **구독 추가 & 관리** - 서비스명, 월간 비용, 결제일, 카테고리 입력/수정/삭제
2. **월별 예상 비용 계산** - 다음 12개월 구독료 자동 예측  
3. **가격 인상 이력 추적** - 구독료 변경 기록 저장 및 조회
4. **취소 가능 시점 알림** - 계약 기간 기반 자동 계산
5. **카테고리별 구독 분류** - 12개 사전 정의 카테고리 지원
6. **월별/카테고리별 비용 차트** - Recharts 기반 시각화
7. **CSV 내보내기** - 구독 목록을 스프레드시트 형식으로 내보내기
8. **검색 & 필터** - 서비스명 검색 및 고급 필터링

추가 기능:
- 📊 **대시보드** - 주요 지표 한눈에 표시
- 💬 **빈 상태 & 로딩 처리** - 사용자 친화적 UX

## 🛠 기술 스택

| 계층 | 기술 |
|------|------|
| **Frontend** | Next.js 16 (App Router, TypeScript) |
| **UI 컴포넌트** | shadcn/ui |
| **CSS** | Tailwind CSS v4 |
| **ORM** | Drizzle ORM 0.31.5 |
| **데이터베이스** | SQLite 3 + better-sqlite3 |
| **빌드** | Next.js built-in |

## 📦 설치 & 실행

### 사전 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 방법

```bash
# 1. 저장소 클론
git clone https://github.com/hongmacho/subscription-vault.git
cd subscription-vault

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 명령어

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build
npm start

# 타입 검사
npx tsc --noEmit

# 린트 검사
npx eslint .
```

## 🏗 프로젝트 구조

```
subscription-vault/
├── app/                    # Next.js 앱 디렉토리
│   ├── api/               # API 라우트
│   ├── subscriptions/     # 구독 목록 페이지
│   ├── analytics/         # 통계 페이지
│   ├── settings/          # 설정 페이지
│   └── page.tsx          # 대시보드
├── db/                     # 데이터베이스
│   ├── schema.ts          # Drizzle 스키마
│   ├── db.ts              # DB 인스턴스
│   └── repositories/      # Data access layer
├── lib/                    # 유틸리티
│   ├── types.ts           # TypeScript 타입
│   └── utils.ts           # 헬퍼 함수
└── public/               # 정적 파일
```

## 📱 화면 구성

### 1. 대시보드 (`/`)
- 주요 지표 카드 (전체 구독, 월간 평균, 이번 달 예상)
- 최근 구독 목록
- 구독 추가 CTA

### 2. 구독 목록 (`/subscriptions`)
- 모든 구독 항목 테이블
- 인라인 추가/수정/삭제 폼
- 검색 & 필터 기능

### 3. 통계 & 리포트 (`/analytics`)
- 월별 예상 비용 시각화
- 카테고리별 분포 그래프
- CSV 내보내기

### 4. 설정 (`/settings`)
- 기본 통화 설정
- 데이터 내보내기/가져오기
- 앱 정보

## 💾 데이터 모델

### subscriptions 테이블
```
- id (PK)
- name: 서비스명
- category: 카테고리
- monthlyPrice: 월간 비용
- billingDayOfMonth: 결제일
- contractStartDate: 계약 시작일
- contractType: monthly|annual|one_time
- isActive: 활성 상태
- notes: 메모
- createdAt, updatedAt
```

### priceHistories 테이블
```
- id (PK)
- subscriptionId (FK)
- previousPrice, newPrice
- changeDate, changeReason
```

### alternativeServices 테이블
```
- id (PK)
- subscriptionId (FK)
- serviceName, monthlyPrice, notes
```

## 📂 카테고리 목록

1. 스트리밍
2. 소프트웨어 - 생산성
3. 소프트웨어 - 개발
4. 클라우드 스토리지
5. 이메일 & 협업
6. 구독형 학습
7. 게이밍
8. 뮤직 & 팟캐스트
9. 건강 & 피트니스
10. VPN & 보안
11. 결제 & 금융
12. 기타

## 🌐 한국어 UI

모든 화면, 버튼, 라벨, 메뉴가 한국어로 제공됩니다.

## 📝 라이선스

MIT License

## 👤 저자

Hong Paul (hongp0508@gmail.com)

---

**마지막 업데이트**: 2024년 7월
