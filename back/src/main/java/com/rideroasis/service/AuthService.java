package com.rideroasis.service;

import com.rideroasis.dto.request.LoginRequest;
import com.rideroasis.dto.request.SignupRequest;
import com.rideroasis.dto.response.AuthResponse;
import com.rideroasis.entity.User;
import com.rideroasis.repository.UserRepository;
import com.rideroasis.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuthenticationManager authenticationManager;
        private final JwtTokenProvider tokenProvider;

        @Transactional
        public AuthResponse signup(SignupRequest request) {
                // 중복 체크
                if (userRepository.existsByUsername(request.getUsername())) {
                        throw new RuntimeException("이미 사용 중인 사용자명입니다.");
                }
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("이미 사용 중인 이메일입니다.");
                }

                // 사용자 생성
                User user = User.builder()
                                .username(request.getUsername())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .nickname(request.getNickname() != null ? request.getNickname() : request.getUsername())
                                .role(User.Role.RIDER)
                                .build();

                user = userRepository.save(user);

                // JWT 토큰 생성
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                String token = tokenProvider.generateToken(authentication);

                return AuthResponse.builder()
                                .token(token)
                                .type("Bearer")
                                .userId(user.getId())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .build();
        }

        public AuthResponse login(LoginRequest request) {
                try {
                        Authentication authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(
                                                        request.getEmail(),
                                                        request.getPassword()));

                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        String token = tokenProvider.generateToken(authentication);

                        User user = userRepository.findByEmail(request.getEmail())
                                        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                        return AuthResponse.builder()
                                        .token(token)
                                        .type("Bearer")
                                        .userId(user.getId())
                                        .username(user.getUsername())
                                        .email(user.getEmail())
                                        .role(user.getRole().name())
                                        .build();
                } catch (org.springframework.security.authentication.BadCredentialsException e) {
                        throw new RuntimeException("이메일 또는 비밀번호가 일치하지 않습니다.");
                } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
                        throw new RuntimeException("이메일 또는 비밀번호가 일치하지 않습니다.");
                } catch (Exception e) {
                        // JWT 생성 오류 등 기타 모든 에러를 일반적인 메시지로 변환
                        System.err.println("로그인 처리 중 오류 발생: " + e.getMessage());
                        e.printStackTrace();
                        throw new RuntimeException("로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                }
        }

        public String findEmail(String nickname) {
                User user = userRepository.findByNickname(nickname)
                                .orElseThrow(() -> new RuntimeException("해당 닉네임을 가진 사용자를 찾을 수 없습니다."));

                String email = user.getEmail();
                int atIndex = email.indexOf("@");
                if (atIndex <= 2) {
                        return email.substring(0, 1) + "***" + email.substring(atIndex);
                }
                return email.substring(0, 3) + "***" + email.substring(atIndex);
        }

        @Transactional
        public String resetPassword(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("해당 이메일을 가진 사용자를 찾을 수 없습니다."));

                // 임시 비밀번호 생성 (8자리 랜덤 문자열)
                String tempPassword = java.util.UUID.randomUUID().toString().substring(0, 8);

                user.setPassword(passwordEncoder.encode(tempPassword));
                userRepository.save(user);

                return tempPassword;
        }
}
