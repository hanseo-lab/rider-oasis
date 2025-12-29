# Rider Oasis - Frontend (React + TypeScript)

## 기술 스택
- **Framework**: React 19.1.1
- **Language**: TypeScript 5.x
- **Build Tool**: Vite 7.2.1
- **State Management**: Zustand 5.x
- **HTTP Client**: Axios 1.x
- **Routing**: React Router DOM 7.x
- **Styling**: Tailwind CSS 3.x
- **Icons**: Lucide React
- **Map**: Leaflet + React-Leaflet

## 프로젝트 구조
```
front/
├── src/
│   ├── api/                  # API 클라이언트 (Axios)
│   │   ├── axios.ts          # JWT 자동 주입
│   │   ├── auth.ts           # 인증 API
│   │   ├── routes.ts         # 경로 API
│   │   └── user.ts           # 사용자 API
│   ├── types/                # TypeScript 타입 정의
│   │   ├── route.ts          # 경로 타입
│   │   └── user.ts           # 사용자 타입
│   ├── pages/                # 페이지 컴포넌트
│   │   ├── LoginPage.tsx     # 로그인
│   │   ├── SignupPage.tsx    # 회원가입
│   │   ├── MainMapPage.tsx   # 메인 지도
│   │   ├── RouteSearchPage.tsx # 경로 탐색
│   │   └── MyPage.tsx        # 마이페이지
│   ├── components/           # 재사용 컴포넌트
│   │   ├── Navigation.tsx    # 네비게이션 바
│   │   ├── RouteComparison.tsx # 경로 비교
│   │   └── RouteMap.tsx      # 지도 컴포넌트
│   ├── store/                # Zustand 상태 관리
│   │   └── authStore.ts      # 인증 상태
│   ├── lib/                  # 유틸리티
│   │   └── ggClimate.ts      # 경기기후 API 헬퍼
│   ├── App.tsx               # 라우팅 설정
│   ├── main.tsx              # 진입점
│   └── index.css             # Tailwind CSS
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 실행 방법

### 개발 서버 실행
```bash
npm install
npm run dev
```

서버가 실행되면 http://localhost:5173 에서 접속 가능합니다.

### 빌드
```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 프리뷰
```bash
npm run preview
```

## 페이지 구성

### 1. 로그인/회원가입
- **경로**: `/login`, `/signup`
- **기능**: JWT 기반 인증

### 2. 메인 지도
- **경로**: `/`
- **기능**:
  - 경기도 기후 데이터 시각화
  - 공원, 문화재, 녹지 등 표시
  - 계절 모드 토글

### 3. 경로 탐색
- **경로**: `/route-search`
- **기능**:
  - 출발지/도착지 설정
  - 경로 타입 선택 (최단/그늘 최적화/쉼터 최적화)
  - 경로 비교
  - 통계 표시 (거리, 시간, 그늘 비율, 폭염 노출도)

### 4. 마이페이지
- **경로**: `/my-page`
- **기능**:
  - **설정**
    - 계절 모드 (AUTO/SUMMER/WINTER)
    - 최대 우회 비율 (0-50%)
    - 그늘 선호, 폭염 회피, 쉼터 표시 토글
  - **통계**
    - 총 주행 거리
    - 평균 그늘 이용률
    - 폭염 회피 정도
    - 레벨 진행률 (Bronze/Silver/Gold/Platinum)
  - **즐겨찾기 경로**
  - **커뮤니티 활동**

## 핵심 기능

### 1. 계절 모드 토글
네비게이션 바에서 계절 모드를 실시간으로 변경할 수 있습니다.
- **자동**: 현재 월 기준 자동 판단
- **여름**: 그늘이 많은 경로 선호
- **겨울**: 그늘이 적은 경로 선호 (블랙아이스 회피)

### 2. 경로 비교
최대 3개의 경로를 동시에 비교하여 최적의 경로를 선택할 수 있습니다.

### 3. 게이미피케이션
- 누적 주행 거리에 따른 레벨 시스템
- 그늘 이용률, 폭염 회피 통계
- 커뮤니티 활동 추적 (게시글, 좋아요)

### 4. 실시간 기후 데이터
경기기후플랫폼 API를 통해 실시간 기후 데이터를 시각화합니다.

## API 연동

### Axios 인스턴스
`src/api/axios.ts`에서 기본 설정:
- Base URL: `http://localhost:8080/api`
- JWT 토큰 자동 주입
- 에러 핸들링

```typescript
import api from './axios';

// 예시: 로그인
const response = await api.post('/auth/login', { username, password });
```

### 인증 상태 관리
Zustand를 사용한 전역 상태 관리:
```typescript
import { useAuthStore } from './store/authStore';

const { user, login, logout, isAuthenticated } = useAuthStore();
```

## 환경 변수

### .env (선택사항)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_CLIMATE_API_KEY=4c58df36-82b2-40b2-b360-6450cca44b1e
```

## 스타일링

### Tailwind CSS
- 다크 모드 기본 (bg-gray-900)
- 그라디언트 효과 (green-400 to blue-400)
- 반응형 디자인

### 주요 컬러 팔레트
- **Primary**: Green-Blue gradient
- **Summer**: Orange tones
- **Winter**: Blue tones
- **Background**: Gray-900

## 의존성

### 주요 라이브러리
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.1.3",
  "zustand": "^5.0.3",
  "axios": "^1.7.9",
  "leaflet": "^1.9.4",
  "react-leaflet": "^5.0.1",
  "lucide-react": "^0.469.0"
}
```

### 개발 의존성
```json
{
  "vite": "^7.2.1",
  "typescript": "~5.7.2",
  "@vitejs/plugin-react": "^4.3.4",
  "tailwindcss": "^3.4.17",
  "autoprefixer": "^10.4.20",
  "postcss": "^8.4.49"
}
```

## 개발 가이드

### 새로운 페이지 추가
1. `src/pages/NewPage.tsx` 생성
2. `src/App.tsx`에 라우트 추가
3. `src/components/Navigation.tsx`에 메뉴 추가 (선택사항)

### 새로운 API 엔드포인트 추가
1. `src/api/` 폴더에 API 함수 작성
2. `src/types/`에 타입 정의 추가

### 타입 에러 해결
TypeScript strict mode를 사용하므로, 모든 타입을 명시해야 합니다.
```typescript
// Good
const user: UserInfo | null = null;

// Bad
const user = null;
```

## 배포

### Vercel 배포 (권장)
```bash
npm run build
vercel --prod
```

### Netlify 배포
```bash
npm run build
# dist/ 폴더를 Netlify에 업로드
```

## 라이센스
MIT License
