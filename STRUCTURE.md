# 📁 Rider Oasis - 프로젝트 구조

## 개요
Rider Oasis는 **모놀리틱 풀스택 애플리케이션**입니다.
- **Backend**: Spring Boot 3.2.1 (Java 17)
- **Frontend**: React 19 + TypeScript + Vite
- **Build**: Gradle (Backend), npm (Frontend)

---

## 📂 디렉토리 구조

```
riderOasis/
│
├── 🔵 BACKEND (Spring Boot)
│   ├── src/main/java/com/rideroasis/
│   │   ├── controller/           # REST API 엔드포인트
│   │   │   ├── AuthController.java
│   │   │   ├── RouteController.java
│   │   │   ├── CommunityController.java
│   │   │   └── UserController.java
│   │   │
│   │   ├── service/              # 비즈니스 로직
│   │   │   ├── AuthService.java
│   │   │   ├── RouteService.java
│   │   │   ├── UserService.java
│   │   │   ├── CommunityService.java
│   │   │   └── ClimateAPIService.java    # 🌍 경기기후 API 통합
│   │   │
│   │   ├── repository/           # 데이터 접근 계층 (JPA)
│   │   │   ├── UserRepository.java
│   │   │   ├── RouteRepository.java
│   │   │   ├── CommunityPostRepository.java
│   │   │   └── CommentRepository.java
│   │   │
│   │   ├── entity/               # JPA 엔티티
│   │   │   ├── User.java        # SeasonMode enum 포함
│   │   │   ├── Route.java
│   │   │   ├── CommunityPost.java
│   │   │   └── Comment.java
│   │   │
│   │   ├── dto/                  # 데이터 전송 객체
│   │   │   ├── request/
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── SignupRequest.java
│   │   │   │   ├── RouteRequest.java
│   │   │   │   └── UserSettingsRequest.java
│   │   │   └── response/
│   │   │       ├── AuthResponse.java
│   │   │       ├── RouteResponse.java
│   │   │       ├── UserResponse.java
│   │   │       └── UserStatsResponse.java
│   │   │
│   │   ├── security/             # JWT 인증/인가
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   └── CustomUserDetailsService.java
│   │   │
│   │   ├── algorithm/            # A* 경로 탐색
│   │   │   └── AStarPathfinder.java    # 🎯 THE SHADE PARADOX 로직
│   │   │
│   │   ├── config/               # 설정
│   │   │   ├── SecurityConfig.java
│   │   │   └── CorsConfig.java
│   │   │
│   │   └── RiderOasisApplication.java  # 메인 클래스
│   │
│   ├── src/main/resources/
│   │   ├── application.yml       # 애플리케이션 설정
│   │   └── application-prod.yml  # 운영 환경 설정
│   │
│   ├── build.gradle              # Gradle 빌드 설정
│   ├── gradlew / gradlew.bat     # Gradle Wrapper
│   └── settings.gradle
│
├── 🟢 FRONTEND (React + TypeScript)
│   ├── src/
│   │   ├── api/                  # API 클라이언트 (Axios)
│   │   │   ├── axios.ts          # JWT 자동 주입
│   │   │   ├── auth.ts
│   │   │   ├── routes.ts
│   │   │   └── user.ts
│   │   │
│   │   ├── types/                # TypeScript 타입 정의
│   │   │   ├── route.ts
│   │   │   └── user.ts           # SeasonMode 타입
│   │   │
│   │   ├── pages/                # 페이지 컴포넌트
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── MainMapPage.tsx   # 기후 데이터 시각화
│   │   │   ├── RouteSearchPage.tsx
│   │   │   └── MyPage.tsx        # 🎮 마이페이지
│   │   │
│   │   ├── components/           # 재사용 컴포넌트
│   │   │   ├── Navigation.tsx    # ☀️❄️ 계절 모드 토글
│   │   │   ├── RouteComparison.tsx
│   │   │   └── RouteMap.tsx
│   │   │
│   │   ├── store/                # Zustand 상태 관리
│   │   │   └── authStore.ts
│   │   │
│   │   ├── lib/                  # 유틸리티
│   │   │   └── ggClimate.ts      # 경기기후 API 헬퍼 (프론트)
│   │   │
│   │   ├── App.tsx               # 라우팅 설정
│   │   ├── main.tsx              # 진입점
│   │   └── index.css             # Tailwind CSS
│   │
│   ├── package.json              # npm 의존성
│   ├── vite.config.ts            # Vite 설정
│   ├── tsconfig.json             # TypeScript 설정
│   └── tailwind.config.js        # Tailwind 설정
│
├── 📄 문서
│   ├── README.md                 # 프로젝트 소개
│   ├── STRUCTURE.md              # 👈 이 파일
│   ├── README_BACKEND.md
│   ├── README_FULLSTACK.md
│   └── SETUP_GUIDE.md
│
└── 🧪 테스트 데이터
    ├── test_signup.json
    ├── test_login.json
    └── test_route.json
```

---

## 🔌 API 통합 아키텍처

### Backend → 경기기후 API
```
ClimateAPIService.java
  ↓
경기기후플랫폼 WFS API
  - https://climate.gg.go.kr/ols/api/geoserver/wfs
  - API Key: 4c58df36-82b2-40b2-b360-6450cca44b1e

활용 레이어:
  📍 park                   - 공원 데이터
  🌳 biotop_type_evl_5grd   - 비오톱(생태) 유형
  🔥 bldg_gas_cbn_ehqty     - 건물 탄소 배출량 (폭염 위험도)
  🏠 dsvctm_tmpr_hab_fclt   - 무더위 쉼터
  ❄️ (한파 쉼터)             - TODO: 레이어 확인 필요
```

### Frontend → Backend API
```
src/api/*.ts (Axios)
  ↓
http://localhost:8080/api/*
  - /auth/*       (인증)
  - /routes/*     (경로 탐색)
  - /user/*       (설정, 통계)
  - /community/*  (커뮤니티)
```

---

## 🎯 핵심 기능 매핑

### 1️⃣ 계절 모드 (THE SHADE PARADOX)
| 위치 | 파일 | 설명 |
|------|------|------|
| Backend | `User.java` | SeasonMode enum (AUTO/SUMMER/WINTER) |
| Backend | `AStarPathfinder.java` | 계절별 가중치 로직 |
| Frontend | `MyPage.tsx` | 계절 모드 설정 UI |
| Frontend | `Navigation.tsx` | 계절 모드 토글 버튼 |

### 2️⃣ 마이페이지 (Gamification)
| 위치 | 파일 | 설명 |
|------|------|------|
| Backend | `UserController.java` | `/user/*` API |
| Backend | `UserService.java` | 통계 계산 로직 |
| Frontend | `MyPage.tsx` | 설정, 통계, 즐겨찾기 UI |
| Frontend | `src/api/user.ts` | User API 클라이언트 |

### 3️⃣ A* 경로 탐색
| 위치 | 파일 | 설명 |
|------|------|------|
| Backend | `AStarPathfinder.java` | A* 알고리즘 구현 |
| Backend | `ClimateAPIService.java` | 실제 기후 데이터 조회 |
| Backend | `RouteService.java` | 경로 생성 서비스 |
| Frontend | `RouteSearchPage.tsx` | 경로 탐색 UI |
| Frontend | `RouteComparison.tsx` | 경로 비교 UI |

---

## 🚀 실행 방법

### Backend 실행
```bash
cd riderOasis
.\gradlew.bat bootRun

# 또는 빌드 후 실행
.\gradlew.bat build
java -jar build/libs/rider-oasis-0.0.1-SNAPSHOT.jar
```

### Frontend 실행
```bash
cd riderOasis
npm install
npm run dev
```

### 동시 실행 (개발 환경)
```bash
# Terminal 1: Backend
.\gradlew.bat bootRun

# Terminal 2: Frontend
npm run dev
```

---

## 📊 데이터 흐름

```
User Input (React)
    ↓
API Call (Axios + JWT)
    ↓
REST Controller (Spring)
    ↓
Service Layer
    ├─→ ClimateAPIService → 경기기후 API
    ├─→ AStarPathfinder (A* 알고리즘)
    └─→ Repository (JPA)
    ↓
Database (H2 / MySQL)
    ↓
Response (JSON)
    ↓
React State Update
    ↓
UI Render (Tailwind CSS)
```

---

## 🔐 보안 & 인증

```
Login/Signup
    ↓
AuthService.java
    ↓
JWT 토큰 발급 (HS512)
    ↓
localStorage에 저장 (Frontend)
    ↓
모든 API 요청에 자동 포함 (axios.ts)
    ↓
JwtAuthenticationFilter.java
    ↓
SecurityContext 설정
    ↓
API 접근 허용
```

---

## 📝 TODO

### Backend
- [ ] 실제 한파 쉼터 레이어 확인 및 적용
- [ ] 경사도 데이터 (DEM) API 통합
- [ ] 제설함 위치 레이어 추가
- [ ] ClimateAPIService 캐시 최적화
- [ ] API 응답 시간 모니터링

### Frontend
- [ ] 겨울 모드 시 한파 쉼터 아이콘 변경 (파란색 → 주황색)
- [ ] 경로 저장 시 seasonMode 포함
- [ ] 모바일 반응형 최적화 (MyPage)
- [ ] 로딩 스피너 & 에러 핸들링 개선
- [ ] PWA 변환 고려

---

## 🌟 주요 의존성

### Backend
- Spring Boot 3.2.1
- Spring Security 6.x
- JJWT 0.12.3 (JWT)
- H2 Database 2.x
- Lombok

### Frontend
- React 19.1.1
- TypeScript 5.x
- Vite 7.2.1
- Zustand 5.x (상태 관리)
- Axios 1.x
- Leaflet 1.9.x (지도)
- Tailwind CSS 3.x
- Lucide React (아이콘)

---

**마지막 업데이트:** 2025-12-29
**작성자:** Claude Code Assistant
