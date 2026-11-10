package com.Chinmay.Hotel.shop.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Chinmay.Hotel.shop.dto.DeleteShopRequestDTO;
import com.Chinmay.Hotel.shop.dto.ShopRequestDTO;
import com.Chinmay.Hotel.shop.dto.ShopResponseDTO;
import com.Chinmay.Hotel.shop.dto.VerifyPasswordRequestDTO;
import com.Chinmay.Hotel.shop.service.AdminShopService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/shops")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminShopController {

    private final AdminShopService adminShopService;

    @GetMapping
    public ResponseEntity<List<ShopResponseDTO>> getAllShops() {
        return ResponseEntity.ok(adminShopService.getAllShops());
    }

    @GetMapping("/{shopId}")
    public ResponseEntity<ShopResponseDTO> getShopById(@PathVariable Integer shopId) {
        return ResponseEntity.ok(adminShopService.getShopById(shopId));
    }

    @PostMapping
    public ResponseEntity<ShopResponseDTO> createShop(
            @RequestBody ShopRequestDTO dto,
            Authentication authentication) {
        String adminUsername = authentication != null ? authentication.getName() : "admin";
        ShopResponseDTO created = adminShopService.createShop(dto, adminUsername);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{shopId}")
    public ResponseEntity<ShopResponseDTO> updateShop(
            @PathVariable Integer shopId,
            @RequestBody ShopRequestDTO dto,
            Authentication authentication) {
        String adminUsername = authentication != null ? authentication.getName() : "admin";
        ShopResponseDTO updated = adminShopService.updateShop(shopId, dto, adminUsername);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{shopId}/status")
    public ResponseEntity<ShopResponseDTO> toggleShopStatus(
            @PathVariable Integer shopId,
            @RequestParam boolean isActive,
            @RequestBody(required = false) DeleteShopRequestDTO dto,
            Authentication authentication) {
        String adminUsername = authentication != null ? authentication.getName() : "admin";
        String password = dto != null ? dto.getAdminPassword() : null;
        ShopResponseDTO updated = adminShopService.toggleShopStatus(shopId, isActive, password, adminUsername);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{shopId}")
    public ResponseEntity<?> deleteShop(
            @PathVariable Integer shopId,
            @RequestBody(required = false) DeleteShopRequestDTO dto,
            Authentication authentication) {
        String adminUsername = authentication != null ? authentication.getName() : "admin";
        String password = dto != null ? dto.getAdminPassword() : null;
        adminShopService.deleteShop(shopId, password, adminUsername);
        return ResponseEntity.ok(Collections.singletonMap("message", "Branch deleted or deactivated successfully."));
    }

    @PostMapping("/{shopId}/delete")
    public ResponseEntity<?> deleteShopPost(
            @PathVariable Integer shopId,
            @RequestBody DeleteShopRequestDTO dto,
            Authentication authentication) {
        String adminUsername = authentication != null ? authentication.getName() : "admin";
        String password = dto != null ? dto.getAdminPassword() : null;
        adminShopService.deleteShop(shopId, password, adminUsername);
        return ResponseEntity.ok(Collections.singletonMap("message", "Branch deleted or deactivated successfully."));
    }

    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(
            @RequestBody VerifyPasswordRequestDTO dto,
            Authentication authentication) {
        String adminUsername = authentication != null ? authentication.getName() : "admin";
        boolean valid = adminShopService.verifyAdminPassword(adminUsername, dto != null ? dto.getPassword() : null);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("valid", false, "message", "Invalid admin password."));
        }
        return ResponseEntity.ok(Map.of("valid", true, "message", "Password verified."));
    }
}
