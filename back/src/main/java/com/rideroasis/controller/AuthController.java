package com.rideroasis.controller;

import com.rideroasis.dto.request.LoginRequest;
import com.rideroasis.dto.request.SignupRequest;
import com.rideroasis.dto.response.ApiResponse;
import com.rideroasis.dto.response.AuthResponse;
import com.rideroasis.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("회원가입 성공", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("로그인 성공", response));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("비밀번호가 일치하지 않습니다."));
        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("이메일 또는 비밀번호를 확인해주세요. (" + e.getMessage() + ")"));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("로그인 실패: " + e.getMessage()));
        }
    }

    @PostMapping("/find-email")
    public ResponseEntity<ApiResponse<String>> findEmail(@RequestBody java.util.Map<String, String> request) {
        try {
            String nickname = request.get("nickname");
            String email = authService.findEmail(nickname);
            return ResponseEntity.ok(ApiResponse.success("이메일 찾기 성공", email));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody java.util.Map<String, String> request) {
        try {
            String email = request.get("email");
            String tempPassword = authService.resetPassword(email);
            // 실제로는 이메일로 보내야 하지만, MVP를 위해 응답에 포함 (보안상 실제 서비스에선 제외해야 함)
            return ResponseEntity.ok(ApiResponse.success("임시 비밀번호가 발급되었습니다.", tempPassword));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("서버가 정상 작동 중입니다."));
    }
}
