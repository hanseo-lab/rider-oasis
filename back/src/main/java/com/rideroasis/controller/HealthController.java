package com.rideroasis.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> root() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "ok");
        status.put("message", "Rider Oasis API server is running");
        return ResponseEntity.ok(status);
    }

    @GetMapping("/health-check")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "ok");
        status.put("message", "Health check passed");
        return ResponseEntity.ok(status);
    }
}
