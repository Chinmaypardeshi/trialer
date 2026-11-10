package com.Chinmay.Hotel.menu.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

import com.Chinmay.Hotel.common.entity.Shops;
import com.Chinmay.Hotel.common.repository.ShopsRepository;
import com.Chinmay.Hotel.menu.dto.AdminGroupedMenuDTO;
import com.Chinmay.Hotel.menu.dto.AdminMenuRequestDTO;
import com.Chinmay.Hotel.menu.dto.AdminMenuResponseDTO;
import com.Chinmay.Hotel.menu.service.AdminMenuService;

@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/admin/menus")
public class AdminMenuController {

    private final AdminMenuService adminMenuService;
    private final ShopsRepository shopsRepository;

    public AdminMenuController(AdminMenuService adminMenuService, ShopsRepository shopsRepository) {
        this.adminMenuService = adminMenuService;
        this.shopsRepository = shopsRepository;
    }

    // Get all registered shops
    @GetMapping("/shops")
    public ResponseEntity<List<Shops>> getAllShops() {
        return ResponseEntity.ok(shopsRepository.findAll());
    }

    // Get all menus by shop
    @GetMapping("/{shopId}")
    public ResponseEntity<List<AdminMenuResponseDTO>> getAllMenus(
        @PathVariable Integer shopId) {
        return ResponseEntity.ok(adminMenuService.getAllMenus(shopId));
    }

    // Add new menu item
    @PostMapping("/{shopId}")
    public ResponseEntity<AdminMenuResponseDTO> addMenu(
        @PathVariable Integer shopId,
        @RequestBody AdminMenuRequestDTO dto) {
        return new ResponseEntity<>(
            adminMenuService.addMenu(shopId, dto),
            HttpStatus.CREATED
        );
    }

    // Update menu item
    @PutMapping("/{menuId}")
    public ResponseEntity<AdminMenuResponseDTO> updateMenu(
        @PathVariable Integer menuId,
        @RequestBody AdminMenuRequestDTO dto) {
        return ResponseEntity.ok(adminMenuService.updateMenu(menuId, dto));
    }

    // Toggle menu active/inactive status
    @PatchMapping("/{menuId}/status")
    public ResponseEntity<Void> toggleMenuStatus(
        @PathVariable Integer menuId,
        @RequestParam Boolean isActive) {
        adminMenuService.toggleMenuStatus(menuId, isActive);
        return ResponseEntity.noContent().build();
    }

    // Delete menu item (DELETE)
    @DeleteMapping("/{menuId}")
    public ResponseEntity<Void> deleteMenu(@PathVariable Integer menuId) {
        adminMenuService.deleteMenu(menuId);
        return ResponseEntity.noContent().build();
    }

    // Delete menu item (POST / PUT fallback aliases)
    @PostMapping("/{menuId}/trash")
    public ResponseEntity<Void> trashMenuPost(@PathVariable Integer menuId) {
        adminMenuService.deleteMenu(menuId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{menuId}/delete")
    public ResponseEntity<Void> deleteMenuPost(@PathVariable Integer menuId) {
        adminMenuService.deleteMenu(menuId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{menuId}/trash")
    public ResponseEntity<Void> trashMenuPut(@PathVariable Integer menuId) {
        adminMenuService.deleteMenu(menuId);
        return ResponseEntity.noContent().build();
    }

    // Frontend specific format: grouped by category
    @GetMapping("/grouped/{shopId}")
    public List<AdminGroupedMenuDTO> getGroupedMenus(
        @PathVariable Integer shopId) {
        return adminMenuService.getGroupedMenus(shopId);
    }
}
