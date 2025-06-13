package com.example.wordgame.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller פשוט לטיפול בדף הבית של השרת
 * מחליף את הWhitelabel Error Page במשהו יותר מקצועי
 */
@RestController
public class HomeController {

    /**
     * דף הבית של השרת API
     * מציג מידע בסיסי על השרת ומפנה למקום הנכון
     *
     * @return מידע על השרת ולינק לאפליקציה
     */
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> home() {
        Map<String, Object> response = new HashMap<>();

        response.put("service", "Word Game API Server");
        response.put("status", "running");
        response.put("version", "1.0");
        response.put("description", "REST API for Word Game application");

        // מידע שימושי למפתחים
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("words", "/api/words");
        endpoints.put("scores", "/api/scores");
        endpoints.put("health_words", "/api/words/health");
        endpoints.put("health_scores", "/api/scores/health");

        response.put("available_endpoints", endpoints);

        // הפניה לאפליקציה האמיתית
        response.put("frontend_url", "http://localhost:3000");
        response.put("message", "This is the API server. For the game interface, visit: http://localhost:3000");

        return ResponseEntity.ok(response);
    }
}