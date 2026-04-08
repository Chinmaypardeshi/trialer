package com.Chinmay.Hotel.Controller.Admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Chinmay.Hotel.DTO.Admin.AdminGroupedMenuDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminMenuGroupDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminMenuRequestDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminMenuResponseDTO;
import com.Chinmay.Hotel.Service.Admin.AdminMenuService;

@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/admin/menus")
public class AdminMenuController {

    private final AdminMenuService adminMenuService;

    public AdminMenuController(AdminMenuService adminMenuService) {
        this.adminMenuService = adminMenuService;
    }

    // Get all menus by shop
    @GetMapping("/{shopId}")
    public ResponseEntity<List<AdminMenuResponseDTO>> getAllMenus(
        @PathVariable Integer shopId) {

            return ResponseEntity.ok(
                adminMenuService.getAllMenus(shopId)
            );
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

    //Update menu item
    @PutMapping("/{menuId}")
    public ResponseEntity<AdminMenuResponseDTO> updateMenu(
            @PathVariable Integer menuId,
            @RequestBody AdminMenuRequestDTO dto) {

        return ResponseEntity.ok(
            adminMenuService.updateMenu(menuId, dto)
        );
    }

    //  Toggle menu active/inactive
    @PatchMapping("/{menuId}/status")
    public ResponseEntity<Void> toggleMenuStatus(
            @PathVariable Integer menuId,
            @RequestParam Boolean isActive) {

        adminMenuService.toggleMenuStatus(menuId, isActive);
        return ResponseEntity.noContent().build();
    }

    //forntend specific format
    @GetMapping("/grouped/{shopId}")
    public List<AdminGroupedMenuDTO> getGroupedMenus(
        @PathVariable Integer shopId
    ) {
        return adminMenuService.getGroupedMenus(shopId);
    }



    
}
