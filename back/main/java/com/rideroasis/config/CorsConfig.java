package com.rideroasis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 프론트엔드 개발 서버 및 배포 주소 허용
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",             // 로컬 개발용
            "http://127.0.0.1:*",             // 로컬 개발용 (IP)
            "https://rider-oasis.vercel.app", // ✅ Vercel 배포 주소 (필수)
            "https://rider-oasis.vercel.app/" // ✅ 끝에 슬래시 있는 경우도 포함
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}