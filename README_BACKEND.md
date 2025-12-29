# Rider Oasis Backend API

**경기 안심 로드** Spring Boot 백엔드 서버

## 기술 스택

- **언어**: Java 17
- **프레임워크**: Spring Boot 3.2.1
- **빌드 도구**: Gradle
- **데이터베이스**: H2 (개발) / Oracle or MySQL (운영)
- **ORM**: JPA (Hibernate)
- **보안**: Spring Security + JWT
- **아키텍처**: Spring MVC 패턴 (Controller-Service-Repository)

## 프로젝트 구조

```
src/main/java/com/rideroasis/
├── RiderOasisApplication.java     # Main Application
├── config/
│   ├── SecurityConfig.java        # Spring Security 설정
│   └── CorsConfig.java            # CORS 설정
├── entity/
│   ├── User.java                  # 사용자 엔티티
│   ├── Route.java                 # 경로 엔티티
│   ├── CommunityPost.java         # 커뮤니티 게시글 엔티티
│   └── Comment.java               # 댓글 엔티티
├── repository/
│   ├── UserRepository.java
│   ├── RouteRepository.java
│   ├── CommunityPostRepository.java
│   └── CommentRepository.java
├── service/
│   ├── AuthService.java           # 인증 서비스
│   ├── RouteService.java          # 경로 서비스
│   └── CommunityService.java      # 커뮤니티 서비스
├── controller/
│   ├── AuthController.java        # 인증 API
│   ├── RouteController.java       # 경로 API
│   └── CommunityController.java   # 커뮤니티 API
├── dto/
│   ├── request/                   # Request DTO
│   └── response/                  # Response DTO
├── security/
│   ├── JwtTokenProvider.java      # JWT 토큰 생성/검증
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
└── algorithm/
    └── AStarPathfinder.java       # A* 경로 탐색 알고리즘
```

## 실행 방법

### 1. 백엔드 서버 실행

```bash
# Windows
.\gradlew.bat bootRun

# Mac/Linux
./gradlew bootRun
```

서버가 `http://localhost:8080/api`에서 실행됩니다.

### 2. H2 Console 접속

- URL: http://localhost:8080/api/h2-console
- JDBC URL: `jdbc:h2:mem:rideroasis`
- Username: `sa`
- Password: (비어있음)

### 3. 프론트엔드 연동

프론트엔드 서버는 기존대로 실행:

```bash
npm run dev
```

## API 엔드포인트

### 인증 (Authentication)

```
POST   /api/auth/signup          # 회원가입
POST   /api/auth/login           # 로그인
GET    /api/auth/health          # 서버 상태 확인
```

### 경로 (Routes)

```
POST   /api/routes                      # 경로 생성 (A* 알고리즘)
GET    /api/routes                      # 내 경로 목록
GET    /api/routes/{id}                 # 경로 상세
DELETE /api/routes/{id}                 # 경로 삭제
PATCH  /api/routes/{id}/favorite        # 즐겨찾기 토글
```

### 커뮤니티 (Community)

```
POST   /api/community/posts                    # 게시글 작성
GET    /api/community/posts                    # 게시글 목록 (페이징)
GET    /api/community/posts/{id}               # 게시글 상세
PUT    /api/community/posts/{id}               # 게시글 수정
DELETE /api/community/posts/{id}               # 게시글 삭제
POST   /api/community/posts/{id}/like          # 좋아요
POST   /api/community/posts/{id}/comments      # 댓글 작성
GET    /api/community/posts/search?keyword=    # 검색
```

## API 사용 예시

### 1. 회원가입

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "rider01",
    "email": "rider01@example.com",
    "password": "password123",
    "nickname": "배달의민족"
  }'
```

### 2. 로그인

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "rider01",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "로그인 성공",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer",
    "userId": 1,
    "username": "rider01",
    "email": "rider01@example.com",
    "role": "RIDER"
  }
}
```

### 3. 경로 생성 (A* 알고리즘)

```bash
curl -X POST http://localhost:8080/api/routes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "routeName": "집 -> 회사 (그늘 경로)",
    "startLat": 37.2636,
    "startLng": 127.0286,
    "startAddress": "경기도 수원시",
    "endLat": 37.2896,
    "endLng": 127.0536,
    "endAddress": "경기도 성남시",
    "routeType": "SHADE_OPTIMIZED"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "경로 생성 성공",
  "data": {
    "id": 1,
    "routeName": "집 -> 회사 (그늘 경로)",
    "distance": 5.23,
    "estimatedTime": 15,
    "shadeRatio": 0.67,
    "heatExposure": 0.32,
    "shelterCount": 3,
    "pathGeoJson": "{\"type\":\"LineString\",\"coordinates\":[[127.0286,37.2636],...]}",
    ...
  }
}
```

### 4. 커뮤니티 게시글 작성

```bash
curl -X POST http://localhost:8080/api/community/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "수원역 근처 대피시설 추천",
    "content": "폭염 심할 때 여기 시원합니다!",
    "category": "SHELTER_INFO",
    "locationLat": 37.2660,
    "locationLng": 127.0010,
    "locationName": "수원역 지하보도"
  }'
```

## 핵심 기능

### 1. JWT 인증

- 모든 API는 JWT 토큰 기반 인증
- `Authorization: Bearer {token}` 헤더 필요
- 토큰 유효기간: 24시간

### 2. A* 경로 탐색 알고리즘

- 폭염 지역 회피
- 그늘/녹지 지역 우선
- 사용자 설정 반영 (preferShade, avoidHeat)
- 실시간 경로 최적화

### 3. 라이더 맞춤 설정

User 엔티티에 저장되는 설정:
- `preferShade`: 그늘 경로 선호
- `avoidHeat`: 폭염 지역 회피
- `showShelters`: 대피시설 표시
- `maxDetourPercent`: 최대 우회 허용 비율

## 데이터베이스 전환

### Oracle로 전환

`application-prod.yml` 파일에서:

```yaml
spring:
  datasource:
    url: jdbc:oracle:thin:@localhost:1521:xe
    driver-class-name: oracle.jdbc.OracleDriver
    username: your_username
    password: your_password
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.Oracle12cDialect
```

### MySQL로 전환

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/rideroasis
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: your_username
    password: your_password
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
```

## 개발 팁

### 1. 빌드

```bash
.\gradlew.bat build
```

### 2. 테스트

```bash
.\gradlew.bat test
```

### 3. Clean

```bash
.\gradlew.bat clean
```

## 보안 설정

- CORS: `http://localhost:5173` (Vite 개발 서버) 허용
- CSRF: Disabled (REST API)
- Session: Stateless (JWT 사용)
- Password: BCrypt 암호화

## 문제 해결

### Java 버전 오류

Java 17 이상 필요:

```bash
java -version
```

### Port 충돌

`application.yml`에서 포트 변경:

```yaml
server:
  port: 8081
```

---

**개발자**: Rider Oasis Team
**버전**: 0.0.1-SNAPSHOT
