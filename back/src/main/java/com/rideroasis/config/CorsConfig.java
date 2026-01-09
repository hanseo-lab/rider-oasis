package com.rideroasis.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> originPatterns = new ArrayList<>();

        // 개발 환경: localhost 허용
        originPatterns.add("http://localhost:*");
        originPatterns.add("http://127.0.0.1:*");

        // 프로덕션 환경: Vercel 및 Railway 도메인 허용
        if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
            originPatterns.addAll(Arrays.asList(allowedOrigins.split(",")));
        }

        // 기본 허용 도메인 추가 (환경 변수 여부와 상관없이 항상 허용)
        originPatterns.add("https://rider-oasis-project.vercel.app");
        originPatterns.add("https://rider-oasis-production.up.railway.app");
        originPatterns.add("https://*.vercel.app");

        configuration.setAllowedOriginPatterns(originPatterns);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
