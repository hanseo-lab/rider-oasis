# Rider Oasis - Backend (Spring Boot)

## 기술 스택
- **Framework**: Spring Boot 3.2.1
- **Language**: Java 17
- **Build Tool**: Gradle 8.5
- **Database**: H2 (Development), Oracle/MySQL (Production)
- **Security**: Spring Security + JWT (HS512)
- **ORM**: JPA/Hibernate
- **API Integration**: 경기기후플랫폼 WFS API

## 프로젝트 구조
```
back/
├── src/
│   ├── main/
│   │   ├── java/com/rideroasis/
│   │   │   ├── controller/      # REST API 엔드포인트
│   │   │   ├── service/         # 비즈니스 로직
│   │   │   ├── repository/      # 데이터 접근 계층
│   │   │   ├── entity/          # JPA 엔티티
│   │   │   ├── dto/             # 데이터 전송 객체
│   │   │   ├── security/        # JWT 인증/인가
│   │   │   ├── algorithm/       # A* 경로 탐색 알고리즘
│   │   │   └── config/          # 설정
│   │   └── resources/
│   │       ├── application.yml
│   │       └── application-prod.yml
│   └── test/
├── build.gradle
├── gradlew
├── gradlew.bat
└── settings.gradle
```

## 실행 방법

### 개발 서버 실행
```bash
# Windows
gradlew.bat bootRun

# Linux/Mac
./gradlew bootRun
```

### 빌드
```bash
# Windows
gradlew.bat build

# Linux/Mac
./gradlew build
```

### JAR 파일 실행
```bash
java -jar build/libs/rider-oasis-0.0.1-SNAPSHOT.jar
```

## API 엔드포인트

### 인증 (Authentication)
- **POST** `/api/auth/signup` - 회원가입
- **POST** `/api/auth/login` - 로그인

### 경로 탐색 (Routes)
- **POST** `/api/routes` - 경로 생성
- **GET** `/api/routes/{id}` - 경로 조회
- **POST** `/api/routes/compare` - 경로 비교
- **DELETE** `/api/routes/{id}` - 경로 삭제
- **POST** `/api/routes/{id}/favorite` - 즐겨찾기 토글

### 사용자 (User)
- **GET** `/api/user/me` - 내 정보 조회
- **PUT** `/api/user/settings` - 설정 업데이트
- **GET** `/api/user/stats` - 통계 조회
- **GET** `/api/user/favorite-routes` - 즐겨찾기 경로 목록

### 커뮤니티 (Community)
- **POST** `/api/community/posts` - 게시글 작성
- **GET** `/api/community/posts` - 게시글 목록
- **POST** `/api/community/posts/{id}/like` - 좋아요

## 핵심 기능

### 1. A* 경로 탐색 알고리즘
- 8방향 탐색
- 하버사인 거리 계산
- 계절별 가중치 변화 ("The Shade Paradox")
  - **여름 모드**: 그늘 = 안전지대 (비용 감소)
  - **겨울 모드**: 그늘 = 블랙아이스 위험 (비용 증가)

### 2. 계절 모드 (SeasonMode)
- `AUTO`: 현재 월 기준 자동 판단 (6-8월=SUMMER, 12-2월=WINTER)
- `SUMMER`: 여름 모드 고정
- `WINTER`: 겨울 모드 고정

### 3. 경기기후 API 통합
- **그늘 점수**: 공원(park), 비오톱(biotop_type_evl_5grd) 데이터
- **폭염 점수**: 건물 탄소 배출량(bldg_gas_cbn_ehqty) 데이터
- **쉼터**: 무더위 쉼터(dsvctm_tmpr_hab_fclt) 데이터
- **경사도**: 경사 위험도 (DEM 데이터)

### 4. JWT 인증
- HS512 알고리즘
- Access Token 발급
- SecurityContext 기반 인증

## 환경 설정

### application.yml
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:rideroasisdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
  h2:
    console:
      enabled: true

jwt:
  secret: your-secret-key-here-min-256-bits
  expiration: 86400000  # 24시간

server:
  port: 8080
```

## 개발 시 참고사항

### H2 Console 접속
- URL: http://localhost:8080/api/h2-console
- JDBC URL: `jdbc:h2:mem:rideroasis`
- Username: `sa`
- Password: (비어있음)

### 테스트 데이터
- 회원가입: `test_signup.json`
- 로그인: `test_login.json`
- 경로 생성: `test_route.json`

## 의존성

### 주요 라이브러리
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Security
- Spring Boot Starter Validation
- JJWT (JWT 처리)
- H2 Database
- Lombok

## 라이센스
MIT License
