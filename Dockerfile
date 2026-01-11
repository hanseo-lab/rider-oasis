# Multi-stage build for Railway (Monorepo support)
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy backend source code specifically
COPY back/ .

# Grant execution permission
RUN chmod +x gradlew

# Validate Gradle wrapper and download dependencies
RUN ./gradlew --version

# Build the application
RUN ./gradlew clean build -x test --no-daemon --stacktrace

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy built jar from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose port (default Spring Boot port)
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
