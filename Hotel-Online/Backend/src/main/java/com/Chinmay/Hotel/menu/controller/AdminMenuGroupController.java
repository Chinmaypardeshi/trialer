package com.Chinmay.Hotel.menu.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Chinmay.Hotel.menu.service.AdminMenuGroupService;
import com.Chinmay.Hotel.menu.service.AdminMenuService;
import com.Chinmay.Hotel.menu.dto.AdminMenuGroupRequestDTO;
import com.Chinmay.Hotel.menu.dto.AdminMenuGroupResponseDTO;
import com.Chinmay.Hotel.menu.dto.MoveMenuItemRequestDTO;

import lombok.RequiredArgsConstructor;

//Connected with adminmenugrouprepository,adminmenugroupservice
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/menu-groups") 
public class AdminMenuGroupController {

    private final AdminMenuGroupService adminMenuGroupService;
    private final AdminMenuService adminMenuService;

    // returns all groups
    @GetMapping("/shop/{shopId}")
    public List<AdminMenuGroupResponseDTO> getAllGroups(@PathVariable Integer shopId) {
        return adminMenuGroupService.getAllGroups(shopId);
    }

    //creates a group
    @PostMapping("/shop/{shopId}")
    public AdminMenuGroupResponseDTO createGroup(
        @PathVariable Integer shopId,
        @RequestBody AdminMenuGroupRequestDTO dto
    ) {
        return adminMenuGroupService.createGroup(shopId, dto);
    }

    //renames a group
    @PutMapping("/{groupId}")
    public AdminMenuGroupResponseDTO renameGroup(
        @PathVariable Integer groupId,
        @RequestBody AdminMenuGroupRequestDTO dto
    ) {
        return adminMenuGroupService.renameGroup(groupId, dto);
    }

    //deletes a group
    @DeleteMapping("/{groupId}")
    public void deleteGroup(@PathVariable Integer groupId) {
        adminMenuGroupService.deleteGroup(groupId);
    }

    //deletes a group (POST fallback)
    @PostMapping("/{groupId}/delete")
    public void deleteGroupPost(@PathVariable Integer groupId) {
        adminMenuGroupService.deleteGroup(groupId);
    }

    //deletes a group (PUT fallback)
    @PutMapping("/{groupId}/trash")
    public void deleteGroupPut(@PathVariable Integer groupId) {
        adminMenuGroupService.deleteGroup(groupId);
    }

    //Move a menu item in a group to another group
    @PutMapping("/{menuId}/move")
    public void moveMenuItem(
        @PathVariable Integer menuId,
        @RequestBody MoveMenuItemRequestDTO dto
    ) {
        adminMenuService.moveMenuItem(menuId, dto.getTargetGroupId());
    }
    
}
