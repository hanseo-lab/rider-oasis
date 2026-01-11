package com.rideroasis.exception;

import com.rideroasis.dto.response.ApiResponse;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiResponse<String>> handleIllegalArgumentException(IllegalArgumentException e) {
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(e.getMessage()));
        }

        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<ApiResponse<String>> handleIllegalStateException(IllegalStateException e) {
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(e.getMessage()));
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
                        MethodArgumentNotValidException ex) {
                Map<String, String> errors = new HashMap<>();
                ex.getBindingResult().getFieldErrors()
                                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error("입력값이 올바르지 않습니다.", errors));
        }

        // 인증 관련 예외
        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<ApiResponse<String>> handleAuthenticationException(AuthenticationException e) {
                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.error("인증에 실패했습니다: " + e.getMessage()));
        }

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ApiResponse<String>> handleBadCredentialsException(BadCredentialsException e) {
                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.error("이메일 또는 비밀번호가 올바르지 않습니다."));
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiResponse<String>> handleAccessDeniedException(AccessDeniedException e) {
                return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.error("접근 권한이 없습니다."));
        }

        // 데이터베이스 관련 예외
        @ExceptionHandler(DataAccessException.class)
        public ResponseEntity<ApiResponse<String>> handleDataAccessException(DataAccessException e) {
                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.error("데이터베이스 오류가 발생했습니다. 잠시 후 다시 시도해주세요."));
        }

        // 외부 API 호출 실패
        @ExceptionHandler(RestClientException.class)
        public ResponseEntity<ApiResponse<String>> handleRestClientException(RestClientException e) {
                return ResponseEntity
                                .status(HttpStatus.SERVICE_UNAVAILABLE)
                                .body(ApiResponse.error("외부 서비스 연결에 실패했습니다. 잠시 후 다시 시도해주세요."));
        }

        // 기타 모든 예외
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<String>> handleException(Exception e) {
                // 로그 출력 (프로덕션에서는 로깅 프레임워크 사용 권장)
                System.err.println("Unexpected error: " + e.getMessage());
                e.printStackTrace();

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.error("서버 내부 오류가 발생했습니다. 관리자에게 문의해주세요."));
        }
}
