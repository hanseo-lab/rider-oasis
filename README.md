# 🛡️ 경기 안심 로드 (Gyeonggi Safety Road)

[![Demo](https://img.shields.io/badge/Demo-Visit%20Site-2ea44f?style=for-the-badge&logo=vercel)](https://rider-oasis.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Hackathon](https://img.shields.io/badge/2025-경기%20기후%20바이브코딩-blue?style=for-the-badge)](https://github.com)

> **"속도보다 생존입니다."**  
> 이동노동자를 위한 사계절 안전 경로 및 커뮤니티 지도

---

## 🔗 배포 주소 (Live Demo)

👉 **웹사이트 바로가기:** [https://rider-oasis.vercel.app](https://rider-oasis.vercel.app)

---

## 📋 목차

- [문제 정의](#-문제-정의-why)
- [솔루션](#-솔루션-what)
- [활용 데이터](#-활용-데이터-data)
- [핵심 기능](#️-핵심-기능-features)
- [기술 스택](#-기술-스택)
- [설치 및 실행](#-설치-및-실행-getting-started)
- [프로젝트 구조](#-프로젝트-구조)
- [API 문서](#-api-문서)
- [라우팅 구조](#-라우팅-구조)
- [해커톤 정보](#️-해커톤-정보)

---

## 🚨 문제 정의 (Why)

### "아스팔트 위 50도, 겨울 그늘길 블랙아이스... 당신의 배달은 안녕하십니까?"

경기도에는 약 **20만 명의 이동노동자**(배달, 택배, 대리운전 등)가 있습니다. 이들은 폭염 특보가 내려진 여름에도, 한파가 몰아치는 겨울에도 가장 위험한 도로 위에서 일해야 합니다.

### 현황 분석

#### 법적 사각지대
일반 근로자와 달리 '폭염 작업 중지권'과 '한파 작업 중지권'의 보호를 받기 어렵습니다.

#### 계절별 위험

**🌞 여름**
- 기상청 기온이 33도일 때, 직사광선을 받은 아스팔트 지면 온도는 **50도 이상** 치솟습니다 (열섬 현상)
- 탈수, 열사병 등 온열질환 위험 증가

**❄️ 겨울**
- 그늘진 도로는 햇빛이 닿지 않아 눈이 녹지 않음
- **블랙아이스** 형성으로 오토바이 전복 사고의 주요 원인

#### 정보의 부재
경기도가 '이동노동자 쉼터'를 확충하고 있지만, 노동자들은 다음을 알 수 없습니다:
- "지금 내 위치에서 가장 가까운 쉼터가 어디인지"
- "어느 길이 안전한지"

---

## 💡 솔루션 (What)

**경기 안심 로드**는 '가장 빠른 길'이 아닌 **'가장 안전한 길'**을 제안합니다.

### 핵심 아이디어

> "배달 경로에서 10분만 더 걸려도, 계절에 맞는 안전 경로로 가면 사고 위험을 50% 줄일 수 있습니다."

### 🔄 The Shade Paradox (그늘의 역설)

**계절에 따라 데이터 해석을 자동으로 반전시켜, 라이더에게 항상 안전한 경로를 제안합니다.**

#### 모드별 동작 방식

| 모드 | 작동 시기 | 경로 선택 기준 |
|------|-----------|----------------|
| **AUTO** 🤖 | 자동 감지 | 현재 계절(6-9월: 여름, 10-5월: 겨울)에 따라 자동 전환 |
| **SUMMER** ☀️ | 6-9월 | 그늘(안전) 비율이 높을수록 추천 |
| **WINTER** ⛄ | 10-5월 | 양지(안전) 비율이 높을수록 추천 |

### 💬 커뮤니티 기능 (NEW ✨)

**라이더들이 직접 정보를 공유하는 플랫폼**

- **비로그인 접근 허용**: 누구나 게시글을 읽고 정보를 얻을 수 있습니다
- **글 작성 및 제보**: 로그인을 통해 위험 구간 제보 및 꿀팁 공유
- **GPS 위치 기반**: 현재 위치를 첨부하여 지도 위에 정보 표시

---

## 📊 활용 데이터 (Data)

**경기기후플랫폼(Climate.gg)의 핵심 데이터 3가지를 융합**

| 데이터셋 명칭 | 활용 목적 | 시각화 방식 |
|---------------|-----------|-------------|
| **폭염 체감온도** | 생존을 위협하는 위험 지역 식별 | 🔴 Red Heatmap (Warning) |
| **현존식생지도** | 나무/녹지가 있어 상대적으로 시원한 지역 식별 | 🟢 Green Zone (Safe) |
| **대피시설 위치** | 긴급 시 휴식할 수 있는 쉼터 정보 제공 | 🔵 Blue Pin (Shelter) |

---

## 🛠️ 핵심 기능 (Features)

### 1. 공개 접근성 강화 ✨ (Updated)
로그인 없이도 핵심 기능을 바로 이용할 수 있습니다:
- 🗺️ 메인 지도 조회
- 🛣️ 경로 탐색
- 💬 커뮤니티 게시글 조회

### 2. 계절별 지능형 경로 제안
- A* 알고리즘 기반 경로 탐색
- 여름/겨울 모드 자동 전환
- 실시간 위험도 분석
- 최적 안전 경로 추천

### 3. 직관적인 UI
복잡한 수치 대신 색상으로 직관적 판단 지원:
- 🔴 위험 지역 (Red Heatmap)
- 🟢 안전 지역 (Green Zone)
- 🔵 쉼터 위치 (Blue Pin)

### 4. 반응형 웹
이동 중인 라이더가 스마트폰에서 즉시 확인 가능한 모바일 최적화

---

## 🛠 기술 스택

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7.2.1
- **State Management**: Zustand
- **Map**: Leaflet + React-Leaflet
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

### Backend
- **Framework**: Spring Boot 3.2.1
- **Language**: Java 17
- **Build Tool**: Gradle 8.5
- **Database**: H2 (Dev), Oracle/MySQL (Prod)
- **Security**: Spring Security + JWT (HS512)
- **ORM**: JPA/Hibernate

### Data & APIs
- 경기기후플랫폼 (Climate.gg) WFS API
- Geolocation API
- Haversine Distance Algorithm

---

## 📦 설치 및 실행 (Getting Started)

이 프로젝트는 **백엔드(`back/`)와 프론트엔드(`front/`)가 분리**되어 있습니다.

### Prerequisites
- Java 17 이상
- Node.js 16 이상
- npm 또는 yarn

### 1️⃣ 백엔드 (Spring Boot)

```bash
cd back

# Windows
gradlew.bat bootRun

# Linux/Mac
./gradlew bootRun
```

**API 서버**: http://localhost:8080/api

#### 환경 설정 (application.yml)

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:h2:mem:rideroasisdb
  h2:
    console:
      enabled: true
```

### 2️⃣ 프론트엔드 (React)

```bash
cd front

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

**웹 애플리케이션**: http://localhost:5173

#### 환경 변수 (.env)

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_CLIMATE_API_KEY=4c58df36-82b2-40b2-b360-6450cca44b1e
```

### 전체 실행 순서

```bash
# 1. 저장소 클론
git clone [repository-url]
cd riderOasis

# 2. 백엔드 실행 (터미널 1)
cd back
./gradlew bootRun

# 3. 프론트엔드 실행 (터미널 2)
cd front
npm install
npm run dev
```

---

## 📁 프로젝트 구조

```
riderOasis/
├── back/                    # 백엔드 (Spring Boot)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/rideroasis/
│   │   │   │       ├── controller/
│   │   │   │       ├── service/
│   │   │   │       ├── repository/
│   │   │   │       ├── entity/
│   │   │   │       ├── security/
│   │   │   │       └── config/
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   ├── build.gradle
│   ├── gradlew
│   └── README.md
│
├── front/                   # 프론트엔드 (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── stores/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── README.md
│
└── README.md
```

---

## 📡 API 문서

### 인증 (Authentication)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | 회원가입 | ❌ |
| POST | `/api/auth/login` | 로그인 | ❌ |

### 경로 탐색 (Routes)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/routes` | 경로 생성 | ✅ |
| GET | `/api/routes/{id}` | 경로 조회 | ❌ |
| POST | `/api/routes/compare` | 경로 비교 | ✅ |
| DELETE | `/api/routes/{id}` | 경로 삭제 | ✅ |
| POST | `/api/routes/{id}/favorite` | 즐겨찾기 토글 | ✅ |

### 사용자 (User)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user/me` | 내 정보 조회 | ✅ |
| PUT | `/api/user/settings` | 설정 업데이트 | ✅ |
| GET | `/api/user/stats` | 통계 조회 | ✅ |

### 커뮤니티 (Community)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/community/posts` | 게시글 목록 | ❌ |
| POST | `/api/community/posts` | 게시글 작성 | ✅ |
| POST | `/api/community/posts/{id}/like` | 좋아요 | ✅ |

---

## 🗺️ 라우팅 구조

### 🔓 공개 라우트 (Public Routes)
로그인 없이 접근할 수 있는 페이지:
- `/` : **메인 지도** (기후 데이터 및 쉼터 위치 확인)
- `/route-search` : **경로 탐색** (출발/도착지 설정 및 안전 경로 추천)
- `/community` : **커뮤니티** (게시글 목록 조회 및 검색)

### 🔒 보호된 라우트 (Protected Routes)
로그인이 필요한 페이지 (비로그인 시 `/login`으로 이동):
- `/my-page` : **마이페이지** (내 정보, 통계, 설정 관리)
- `/community/create` : **글 작성** (위험 제보 및 게시글 등록)

### 🚫 인증 전용 라우트 (Auth Routes)
이미 로그인한 사용자는 접근 불가 (메인으로 이동):
- `/login` : 로그인
- `/signup` : 회원가입

---

## 🧮 핵심 알고리즘

### A* 경로 탐색 알고리즘

**특징:**
- 8방향 탐색 (상하좌우 + 대각선)
- 하버사인 거리 계산으로 정확한 위경도 거리 산출
- 계절별 가중치 적용 ("The Shade Paradox")

**계절별 로직:**
```java
// 여름: 그늘 = 안전 (비용 감소)
if (isSummer) {
    cost -= shadeRatio * SAFETY_BONUS;
}

// 겨울: 그늘 = 위험 (비용 증가, 블랙아이스)
if (isWinter) {
    cost += shadeRatio * DANGER_PENALTY;
}
```

### JWT 인증 및 보안

**SecurityConfig 설정:**
```java
// 비로그인 접근 허용 경로
.requestMatchers("/", "/api/auth/**").permitAll()
.requestMatchers(HttpMethod.GET, "/api/community/posts").permitAll()
.requestMatchers(HttpMethod.GET, "/api/routes/**").permitAll()
```

---

## 🎖️ 해커톤 정보

**2025 경기 기후 바이브코딩 해커톤**
- 프로그램: After Program 참여 작품
- 주제: 기후위기 대응 솔루션
- 데이터: 경기기후플랫폼(Climate.gg) 활용

---

## 📄 라이선스

MIT License

---

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면 Pull Request를 보내주세요!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

<div align="center">

**"속도보다 생존입니다."**

Made with ❤️ for 이동노동자

[![Visit Site](https://img.shields.io/badge/Visit-rider--oasis.vercel.app-success?style=for-the-badge)](https://rider-oasis.vercel.app)

</div>