# 🔥 경기 그늘 로드 (Gyeonggi Shade Road)
> **"속도보다 생존입니다."** 이동노동자를 위한 폭염 회피 및 쉼터 연계 지도

## 1. 🚨 문제 정의 (Why)
**"아스팔트 위 50도, 당신의 배달은 안녕하십니까?"**

경기도에는 약 20만 명의 이동노동자(배달, 택배, 대리운전 등)가 있습니다. 이들은 폭염 특보가 내려진 날에도 가장 뜨거운 도로 위에서 일해야 합니다.

* **법적 사각지대:** 일반 근로자와 달리 '폭염 작업 중지권'의 보호를 받기 어렵습니다.
* **데이터의 괴리:** 기상청 기온이 33도일 때, 직사광선을 받은 아스팔트 지면 온도는 **50도 이상** 치솟습니다. (열섬 현상)
* **정보의 부재:** 경기도가 '이동노동자 쉼터'를 확충하고 있지만, 노동자들은 **"지금 내 위치에서 가장 가까운 쉼터가 어디인지", "어느 길이 덜 뜨거운지"** 알 방법이 없습니다.

## 2. 💡 솔루션 (What)
**경기 그늘 로드**는 '가장 빠른 길'이 아닌 **'가장 안전한 길'**을 제안합니다.

### 핵심 아이디어

**"배달 경로에서 10분만 더 걸려도, 그늘길로 가면 온열질환 위험을 50% 줄일 수 있습니다."**

### 제공하는 정보

1.  **위험 시각화 🔴**
    - 건물 밀집 지역을 탄소 배출량 데이터로 식별
    - 열섬 효과가 높은 위험 구간을 붉은색 히트맵으로 경고
    - "이 구간은 피하세요" 메시지 전달

2.  **안전지대 제안 🟢**
    - 공원, 녹지, 가로수길 등 그늘이 있는 구간을 초록색으로 표시
    - 나무가 있어 체감 온도가 3-5도 낮은 구간 안내
    - "이 길로 우회하세요" 대안 제시

3.  **쉼터 연결 🔵**
    - 경기도 전역 3,333개 무더위 쉼터 위치 표시
    - 클릭 한 번으로 시설명, 수용 인원, 주소 확인
    - 긴급 상황 시 가장 가까운 냉방 시설 찾기

### 작동 방식

```
1. 사용자가 지도 접속
   ↓
2. 경기도 중심으로 지도 표시
   ↓
3. 3가지 데이터 레이어 동시 로딩:
   - 폭염 위험 지역 (붉은색)
   - 시원한 그늘 지역 (초록색)
   - 무더위 쉼터 (파란색 마커)
   ↓
4. 지도 확대/축소로 원하는 지역 탐색
   ↓
5. 마커 클릭으로 상세 정보 확인
```

## 3. 📊 활용 데이터 (Data)
경기기후플랫폼(Climate.gg)의 핵심 데이터 3가지를 융합하여 분석했습니다.

| 데이터셋 명칭 | 활용 목적 | 시각화 방식 |
| :--- | :--- | :--- |
| **폭염 체감온도** | 생존을 위협하는 위험 지역 식별 | 🔴 Red Heatmap (Warning) |
| **현존식생지도** | 나무/녹지가 있어 상대적으로 시원한 지역 식별 | 🟢 Green Zone (Safe) |
| **대피시설 위치** | 긴급 시 휴식할 수 있는 쉼터 정보 제공 | 🔵 Blue Pin (Shelter) |

## 4. 🛠️ 핵심 기능 (Features)
* **직관적인 UI:** 복잡한 수치 대신 색상(🔴위험 vs 🟢안전)으로 직관적 판단 지원
* **원클릭 쉼터 정보:** 지도 위 파란 핀(💧) 클릭 시 시설명 및 위치 정보 팝업 제공
* **반응형 웹:** 이동 중인 라이더가 스마트폰에서 즉시 확인 가능한 모바일 최적화

## 5. 🌏 기대 효과 (Impact)
1.  **사회적 안전망 강화:** 이동노동자의 온열질환 예방 및 생존권 보호
2.  **정책 효율성 증대:** 기존에 설치된 무더위 쉼터의 실제 이용률 제고
3.  **확장성:** 향후 내비게이션 API와 연동 시 '그늘 경로 안내' 서비스로 발전 가능

## 6. 🚀 기술 스택 (Tech Stack)

### Backend (NEW ✨)
* **Framework:** Spring Boot 3.2.1
* **Language:** Java 17
* **Database:** H2 (개발), Oracle/MySQL (운영)
* **Security:** Spring Security + JWT (HS512)
* **ORM:** JPA/Hibernate
* **Build:** Gradle 8.5 (Wrapper 포함)

### Frontend
* **Framework:** React 19 + TypeScript
* **지도 라이브러리:** Leaflet + React Leaflet
* **상태 관리:** Zustand
* **라우팅:** React Router DOM
* **HTTP Client:** Axios (JWT 자동 주입)
* **스타일링:** Tailwind CSS
* **빌드:** Vite 7.2.1
* **데이터 소스:** 경기기후플랫폼 API (Climate.gg)

### 알고리즘 (NEW ✨)
* **경로 탐색:** A* (A-Star) Pathfinding Algorithm
* **비용 함수:** 거리 + 그늘 가중치 + 폭염 노출도
* **최적화:** 8방향 이동, Haversine 거리 계산

## 7. 📦 설치 및 실행 (Getting Started)

### 사전 요구사항
* Java 17 이상
* Node.js 18 이상
* Git

### 1️⃣ 저장소 클론
```bash
git clone https://github.com/hanseo-lab/rider-oasis.git
cd rider-oasis
```

### 2️⃣ 백엔드 서버 설정 및 실행 (NEW ✨)
```bash
# Gradle Wrapper를 사용하여 빌드 (전역 Gradle 불필요)
./gradlew build          # Linux/Mac
.\gradlew.bat build      # Windows

# 서버 실행
./gradlew bootRun        # Linux/Mac
.\gradlew.bat bootRun    # Windows
```

**백엔드 서버 주소:**
- API: http://localhost:8080/api
- H2 Console: http://localhost:8080/api/h2-console

### 3️⃣ 프론트엔드 설정 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

**프론트엔드 서버 주소:**
- 웹 애플리케이션: http://localhost:5173

### 배포
```bash
# 프론트엔드 빌드
npm run build

# 백엔드 JAR 생성
./gradlew build
```

## 8. 📁 프로젝트 구조

```
rider-oasis/
├── src/main/java/com/rideroasis/    # 백엔드 (NEW ✨)
│   ├── controller/                  # REST API 컨트롤러
│   │   ├── AuthController.java      # 인증 API
│   │   ├── RouteController.java     # 경로 탐색 API
│   │   └── CommunityController.java # 커뮤니티 API
│   ├── service/                     # 비즈니스 로직
│   │   ├── AuthService.java
│   │   └── RouteService.java
│   ├── repository/                  # 데이터 접근 계층
│   ├── entity/                      # JPA 엔티티
│   │   ├── User.java
│   │   ├── Route.java
│   │   └── CommunityPost.java
│   ├── security/                    # JWT 인증/인가
│   │   ├── JwtTokenProvider.java
│   │   └── JwtAuthenticationFilter.java
│   ├── algorithm/                   # A* 알고리즘
│   │   └── AStarPathfinder.java
│   └── config/                      # 설정
│       ├── SecurityConfig.java
│       └── CorsConfig.java
├── src/main/resources/
│   └── application.yml              # 애플리케이션 설정
├── src/ (frontend)
│   ├── api/                         # API 클라이언트 (NEW ✨)
│   │   ├── axios.ts                 # Axios 설정 (JWT 자동 주입)
│   │   ├── auth.ts                  # 인증 API
│   │   └── routes.ts                # 경로 API
│   ├── components/                  # React 컴포넌트 (NEW ✨)
│   │   ├── Navigation.tsx           # 네비게이션 바
│   │   ├── RouteComparison.tsx      # 경로 비교 UI
│   │   └── RouteMap.tsx             # 경로 지도
│   ├── pages/                       # 페이지 (NEW ✨)
│   │   ├── LoginPage.tsx            # 로그인
│   │   ├── SignupPage.tsx           # 회원가입
│   │   ├── RouteSearchPage.tsx      # 경로 탐색
│   │   └── MainMapPage.tsx          # 메인 지도
│   ├── store/                       # 상태 관리 (NEW ✨)
│   │   └── authStore.ts             # Zustand 인증 상태
│   ├── types/                       # TypeScript 타입 (NEW ✨)
│   │   └── route.ts
│   ├── lib/
│   │   └── ggClimate.ts             # 경기기후 API 헬퍼
│   ├── App.tsx                      # 라우터 설정
│   ├── index.css                    # Tailwind
│   └── main.tsx                     # 진입점
├── build.gradle                     # Gradle 설정 (NEW ✨)
├── package.json
└── README.md
```

## 9. 🎯 새로운 핵심 기능 (NEW ✨)

### 1️⃣ 회원가입 및 로그인
- JWT 기반 인증 시스템
- BCrypt 비밀번호 암호화
- 자동 토큰 갱신

### 2️⃣ 스마트 경로 탐색
**"최단 경로 vs 그늘 경로"** 비교 기능

#### 사용 방법:
1. 경로 탐색 페이지에서 출발지/도착지 입력
2. Nominatim API로 주소 → 좌표 변환
3. A* 알고리즘으로 두 가지 경로 계산:
   - **최단 경로**: 가장 빠른 경로
   - **그늘 경로**: 폭염 노출 최소화 경로
4. 실시간 비교 통계 제공:
   - 거리 차이
   - 시간 차이
   - 그늘 비율 증가율
   - 폭염 노출 감소율

#### 경로 통계 정보:
- 총 거리 (km)
- 예상 시간 (분)
- 그늘 비율 (0-100%)
- 폭염 노출도 (0-100%)
- 대피시설 개수

### 3️⃣ 경로 시각화
- Leaflet 지도에 경로 표시
- 출발지(🟢), 도착지(🔴) 마커
- 경로 유형별 색상 구분:
  - 최단 경로: 파란색
  - 그늘 경로: 초록색
- GeoJSON 기반 폴리라인 렌더링

### 4️⃣ 경로 저장 및 관리
- 즐겨찾는 경로 저장
- 경로 히스토리 조회
- 경로 삭제 및 즐겨찾기

## 10. 📡 REST API 엔드포인트 (NEW ✨)

### 인증 API
```
POST   /api/auth/signup      # 회원가입
POST   /api/auth/login       # 로그인
GET    /api/auth/health      # 서버 상태
```

### 경로 API
```
POST   /api/routes                    # 경로 생성 (A* 알고리즘)
GET    /api/routes                    # 내 경로 목록
GET    /api/routes/{id}               # 경로 상세
DELETE /api/routes/{id}               # 경로 삭제
PATCH  /api/routes/{id}/favorite      # 즐겨찾기 토글
```

### 커뮤니티 API
```
GET    /api/community/posts           # 게시글 목록
POST   /api/community/posts           # 게시글 작성
GET    /api/community/posts/{id}      # 게시글 조회
PUT    /api/community/posts/{id}      # 게시글 수정
DELETE /api/community/posts/{id}      # 게시글 삭제
POST   /api/community/posts/{id}/like # 좋아요
```

### API 사용 예시
```bash
# 회원가입
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"rider01","email":"rider@test.com","password":"password123","nickname":"라이더"}'

# 경로 생성 (그늘 경로)
curl -X POST http://localhost:8080/api/routes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  -d '{
    "routeName":"수원역 → 성남시청",
    "startLat":37.2660,"startLng":127.0010,
    "endLat":37.4201,"endLng":127.1262,
    "routeType":"SHADE_OPTIMIZED"
  }'
```

## 11. 🗺️ 사용된 API 레이어

### 경기기후플랫폼 API (Climate.gg)

**API 엔드포인트:** `https://climate.gg.go.kr/ols/api/geoserver/wfs`
**API 키:** `4c58df36-82b2-40b2-b360-6450cca44b1e`

### 활용 데이터셋

#### 1️⃣ 폭염 위험 지역 (붉은색 히트맵)
**레이어:** `bldg_gas_cbn_ehqty` (건물 가스 탄소 배출량)
- **데이터 타입:** Polygon (건물 경계)
- **좌표계:** EPSG:5186 (한국 중부원점 TM)
- **활용 방법:** 건물 밀집도와 탄소 배출량이 높은 지역을 도시 열섬 효과의 대리 지표로 활용
- **시각화:** 배출량에 따라 붉은색 투명도 조절 (0.3-0.7)
- **데이터 개수:** 약 300개 건물 표시

#### 2️⃣ 시원한 그늘 지역 (초록색 영역)
**레이어:** `park` (공원 데이터)
- **데이터 타입:** Polygon (공원 경계)
- **좌표계:** EPSG:5186
- **활용 방법:** 공원, 녹지, 가로수길 등 나무가 있어 그늘을 제공하는 안전지대 표시
- **시각화:** 초록색 반투명 영역 (투명도 0.4)
- **데이터 개수:** 약 500개 공원/녹지 표시
- **포함 정보:** 공원명, 위치(시군구), 면적

#### 3️⃣ 무더위 대피시설 (파란색 마커)
**레이어:** `dsvctm_tmpr_hab_fclt` (폭염 온도 관련 시설)
- **데이터 타입:** Point (시설 위치)
- **좌표계:** EPSG:4326 (WGS84 - GPS 표준 좌표계)
- **활용 방법:** 경기도가 지정한 무더위 쉼터 위치 안내
- **시각화:** 파란색 마커 핀
- **데이터 개수:** 최대 1,000개 쉼터 표시
- **포함 정보:**
  - 시설명 (예: "아치울 마을회관")
  - 시설 유형 (예: "마을회관", "경로당")
  - 수용 인원
  - 주소
  - 관리 부서 및 연락처

### API 호출 예시

```javascript
// 무더위 쉼터 데이터 가져오기
const response = await fetch(
  'https://climate.gg.go.kr/ols/api/geoserver/wfs?' +
  'apiKey=4c58df36-82b2-40b2-b360-6450cca44b1e' +
  '&service=WFS' +
  '&version=1.1.0' +
  '&request=GetFeature' +
  '&typeName=dsvctm_tmpr_hab_fclt' +
  '&outputFormat=application/json' +
  '&maxFeatures=1000'
)
const data = await response.json()
```

---

## 🔗 Links

- **Demo URL:** [https://rider-oasis.vercel.app](https://rider-oasis.vercel.app)
- **GitHub:** [https://github.com/hanseo-lab/rider-oasis](https://github.com/hanseo-lab/rider-oasis)

---

*2025 경기 기후 바이브코딩 해커톤 출품작*
