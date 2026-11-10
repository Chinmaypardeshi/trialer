package com.Chinmay.Hotel.menu.service.Impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Chinmay.Hotel.common.repository.ShopsRepository;
import com.Chinmay.Hotel.menu.dto.AdminMenuGroupRequestDTO;
import com.Chinmay.Hotel.menu.dto.AdminMenuGroupResponseDTO;
import com.Chinmay.Hotel.menu.entity.Menu;
import com.Chinmay.Hotel.menu.entity.MenuGroup;
import com.Chinmay.Hotel.menu.repository.MenuGroupRepository;
import com.Chinmay.Hotel.menu.repository.MenuRepository;
import com.Chinmay.Hotel.menu.service.AdminMenuGroupService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class AdminMenuGroupServiceImpl implements AdminMenuGroupService {
    
    private final MenuGroupRepository menuGroupRepository;
    private final ShopsRepository shopsRepository;
    private final MenuRepository menuRepository;

    // Get all groups for a shop
    @Override
    public List<AdminMenuGroupResponseDTO> getAllGroups(Integer shopId) {
        return menuGroupRepository
            .findByShopId_ShopIdOrderByGroupNameAsc(shopId)
            .stream()
            .map(g -> new AdminMenuGroupResponseDTO(
                g.getGroupId(),
                g.getGroupName()
            ))
            .toList();
    }

    // Create a group
    @Override
    public AdminMenuGroupResponseDTO createGroup(Integer shopId, AdminMenuGroupRequestDTO dto) {
        if (menuGroupRepository.existsByShopId_ShopIdAndGroupNameIgnoreCase(shopId, dto.getGroupName())) {
            throw new RuntimeException("Group already exists");
        }

        MenuGroup group = new MenuGroup();
        group.setGroupName(dto.getGroupName());
        group.setShopId(
            shopsRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"))
        );

        menuGroupRepository.save(group);

        return new AdminMenuGroupResponseDTO(
            group.getGroupId(),
            group.getGroupName()
        );
    }

    // Rename a group
    @Override
    public AdminMenuGroupResponseDTO renameGroup(Integer groupId, AdminMenuGroupRequestDTO dto) {
        MenuGroup group = menuGroupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));

        group.setGroupName(dto.getGroupName());

        return new AdminMenuGroupResponseDTO(
            group.getGroupId(),
            group.getGroupName()
        );
    }

    // Delete a group safely: move all items to TRASH group and deactivate them
    @Override
    public void deleteGroup(Integer groupId) {
        MenuGroup group = menuGroupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));

        if (group.getGroupName().equalsIgnoreCase("UNCATEGORIZED") || group.getGroupName().equalsIgnoreCase("TRASH")) {
            throw new RuntimeException("Default / TRASH group cannot be deleted");
        }

        MenuGroup trashGroup = menuGroupRepository.findByGroupNameIgnoreCaseAndShopId("TRASH", group.getShopId())
            .or(() -> menuGroupRepository.findByGroupNameIgnoreCaseAndShopId("UNCATEGORIZED", group.getShopId()))
            .orElseGet(() -> {
                MenuGroup newTrash = new MenuGroup();
                newTrash.setGroupName("TRASH");
                newTrash.setShopId(group.getShopId());
                return menuGroupRepository.save(newTrash);
            });

        // Move all menu items inside this group to TRASH and deactivate them
        List<Menu> menus = menuRepository.findByMenuGroup(group);
        for (Menu menu : menus) {
            menu.setMenuGroup(trashGroup);
            menu.setIsActive(false);
            menuRepository.save(menu);
        }

        // Delete the group safely
        menuGroupRepository.delete(group);
    }
}
