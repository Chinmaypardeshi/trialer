package com.Chinmay.Hotel.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> login() {
        // If the user reaches this, Spring Security has already validated them
        return ResponseEntity.ok(Map.of(
            "message", "Login successful",
            "role", "ADMIN"
        ));
    }
}