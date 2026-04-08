package com.Chinmay.Hotel.Controller.Admin;

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

import com.Chinmay.Hotel.DTO.Admin.AdminMenuGroupRequestDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminMenuGroupResponseDTO;
import com.Chinmay.Hotel.DTO.Admin.MoveMenuItemRequestDTO;
import com.Chinmay.Hotel.Service.Admin.AdminMenuGroupService;
import com.Chinmay.Hotel.Service.Admin.AdminMenuService;

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

    //Move a menu item in a group to another group
    @PutMapping("/{menuId}/move")
    public void moveMenuItem(
        @PathVariable Integer menuId,
        @RequestBody MoveMenuItemRequestDTO dto
    ) {
        adminMenuService.moveMenuItem(menuId, dto.getTargetGroupId());
    }
    
}
