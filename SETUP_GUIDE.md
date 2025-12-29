# 설치 및 실행 가이드

## 🚨 현재 상황

Java 17은 설치되어 있지만, **Gradle/Maven**이 설치되지 않아 자동 실행이 불가능합니다.

## 🛠️ 해결 방법 (3가지 옵션)

### ✅ Option 1: IntelliJ IDEA로 실행 (권장)

1. **IntelliJ IDEA 설치**
   - Community Edition (무료): https://www.jetbrains.com/idea/download/

2. **프로젝트 열기**
   - IntelliJ 실행
   - "Open" → `C:\riderOasis` 선택
   - Gradle 프로젝트로 자동 인식됨

3. **의존성 다운로드**
   - 우측 Gradle 탭 클릭
   - "Reload All Gradle Projects" 클릭
   - 자동으로 모든 의존성 다운로드

4. **서버 실행**
   - `src/main/java/com/rideroasis/RiderOasisApplication.java` 파일 열기
   - 녹색 실행 버튼 클릭 또는 `Shift + F10`
   - 콘솔에 "Rider Oasis Backend Server Started!" 표시 확인

### Option 2: Gradle 수동 설치 후 실행

1. **Gradle 다운로드**
   ```
   https://gradle.org/install/
   ```

2. **환경 변수 설정**
   - `GRADLE_HOME` 설정
   - PATH에 `%GRADLE_HOME%\bin` 추가

3. **프로젝트 실행**
   ```bash
   cd C:\riderOasis
   gradle bootRun
   ```

### Option 3: Maven 사용

1. **Maven 다운로드**
   ```
   https://maven.apache.org/download.cgi
   ```

2. **환경 변수 설정**
   - `MAVEN_HOME` 설정
   - PATH에 `%MAVEN_HOME%\bin` 추가

3. **프로젝트 실행**
   ```bash
   cd C:\riderOasis
   mvn spring-boot:run
   ```

---

## 🎯 백엔드 서버 실행 확인

서버가 정상적으로 실행되면 다음과 같이 표시됩니다:

```
==============================================
  Rider Oasis Backend Server Started!
  API: http://localhost:8080/api
  H2 Console: http://localhost:8080/api/h2-console
==============================================
```

### Health Check

브라우저나 curl로 확인:
```bash
curl http://localhost:8080/api/auth/health
```

응답:
```json
{
  "success": true,
  "message": "서버가 정상 작동 중입니다.",
  "data": "서버가 정상 작동 중입니다."
}
```

---

## 🌐 프론트엔드 실행

백엔드 서버가 실행되면, 새 터미널에서:

```bash
cd C:\riderOasis
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 🧪 API 테스트 (백엔드만)

백엔드가 실행 중이면 curl로 테스트:

### 1. 회원가입
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"rider01\",\"email\":\"rider01@test.com\",\"password\":\"password123\",\"nickname\":\"테스트라이더\"}"
```

### 2. 로그인
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"rider01\",\"password\":\"password123\"}"
```

응답에서 `token` 값 복사

### 3. 경로 생성
```bash
curl -X POST http://localhost:8080/api/routes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"routeName\":\"테스트경로\",\"startLat\":37.2636,\"startLng\":127.0286,\"endLat\":37.2896,\"endLng\":127.0536,\"routeType\":\"SHADE_OPTIMIZED\"}"
```

---

## 📊 생성된 파일 현황

### ✅ 백엔드 (완료)
```
src/main/java/com/rideroasis/
├── RiderOasisApplication.java        ✓ 메인 애플리케이션
├── algorithm/AStarPathfinder.java    ✓ A* 알고리즘
├── config/                           ✓ Spring Security, CORS
├── controller/                       ✓ REST API
├── dto/                              ✓ Request/Response DTO
├── entity/                           ✓ User, Route, Community
├── repository/                       ✓ JPA Repository
├── security/                         ✓ JWT
└── service/                          ✓ 비즈니스 로직
```

### ✅ 프론트엔드 (완료)
```
src/
├── api/                              ✓ API 클라이언트
├── components/                       ✓ UI 컴포넌트
├── pages/                            ✓ 페이지들
├── store/                            ✓ 상태 관리
└── App.tsx                           ✓ 라우팅
```

### ✅ 설정 파일
```
build.gradle                          ✓ Gradle 설정
pom.xml                               ✓ Maven 설정
application.yml                       ✓ Spring Boot 설정
```

---

## 💡 빠른 시작 (추천)

**가장 빠른 방법**: IntelliJ IDEA Community Edition 설치

1. IntelliJ 다운로드: https://www.jetbrains.com/idea/download/
2. 설치 후 `C:\riderOasis` 열기
3. Gradle 프로젝트 자동 인식
4. `RiderOasisApplication.java` 실행
5. 새 터미널에서 `npm run dev`
6. 브라우저에서 `http://localhost:5173` 접속

---

## 🔧 문제 해결

### "Java version" 오류
- Java 17 이상 필요
- `java -version` 확인

### Port 8080 사용 중
- `application.yml`에서 포트 변경:
  ```yaml
  server:
    port: 8081
  ```

### CORS 오류
- 백엔드 `CorsConfig.java` 확인
- 프론트엔드 URL이 허용 목록에 있는지 확인

---

## 📞 지원

문제가 계속되면:
1. IntelliJ IDEA 콘솔 로그 확인
2. 브라우저 개발자 도구 확인
3. H2 Console 접속: http://localhost:8080/api/h2-console
