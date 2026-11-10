package com.Chinmay.Hotel.menu.service.Impl;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Chinmay.Hotel.common.entity.Shops;
import com.Chinmay.Hotel.menu.dto.AdminGroupedMenuDTO;
import com.Chinmay.Hotel.menu.dto.AdminGroupedMenuItemDTO;
import com.Chinmay.Hotel.menu.dto.AdminMenuGroupDTO;
import com.Chinmay.Hotel.menu.dto.AdminMenuRequestDTO;
import com.Chinmay.Hotel.menu.dto.AdminMenuResponseDTO;
import com.Chinmay.Hotel.menu.entity.Menu;
import com.Chinmay.Hotel.menu.entity.MenuGroup;
import com.Chinmay.Hotel.menu.repository.MenuGroupRepository;
import com.Chinmay.Hotel.menu.repository.MenuRepository;
import com.Chinmay.Hotel.menu.service.AdminMenuService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminMenuServiceImpl implements AdminMenuService {

    private final MenuRepository menuRepository;
    private final MenuGroupRepository menuGroupRepository;

    // Admin CRUD

    // Get All Menus (By Shop)
    @Override
    public List<AdminMenuResponseDTO> getAllMenus(Integer shopId) {
        return menuRepository.findAllMenusWithGroup(shopId)
            .stream()
            .map(menu -> new AdminMenuResponseDTO(
                menu.getMenuId(),
                menu.getItemName(),
                menu.getPrice(),
                menu.getIsActive(),
                menu.getMenuGroup().getGroupId(),
                menu.getMenuGroup().getGroupName()
            ))
            .toList();
    }

    // Add Menu Item
    @Override
    @Transactional
    public AdminMenuResponseDTO addMenu(Integer shopId, AdminMenuRequestDTO dto) {
        MenuGroup group = menuGroupRepository.findById(dto.getGroupId())
            .orElseThrow(() -> new RuntimeException("Group not found"));

        // Duplicate check
        boolean exists = menuRepository.existsByItemNameAndShopIdAndMenuGroup_GroupId(
            dto.getItemName(),
            group.getShopId(),
            group.getGroupId()
        );

        if (exists) {
            throw new RuntimeException("Item already exists in this group");
        }

        Menu menu = new Menu();
        menu.setItemName(dto.getItemName());
        menu.setPrice(dto.getPrice());
        menu.setMenuGroup(group);
        menu.setShopId(group.getShopId());
        menu.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        menuRepository.save(menu);

        return new AdminMenuResponseDTO(
            menu.getMenuId(),
            menu.getItemName(),
            menu.getPrice(),
            menu.getIsActive(),
            group.getGroupId(),
            group.getGroupName()
        );
    }

    // Update Menu Item
    @Override
    @Transactional
    public AdminMenuResponseDTO updateMenu(Integer menuId, AdminMenuRequestDTO dto) {
        Menu menu = menuRepository.findById(menuId)
            .orElseThrow(() -> new RuntimeException("Menu not found"));

        if (dto.getItemName() != null)
            menu.setItemName(dto.getItemName());

        if (dto.getPrice() != null)
            menu.setPrice(dto.getPrice());

        if (dto.getGroupId() != null) {
            MenuGroup group = menuGroupRepository.findById(dto.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));
            menu.setMenuGroup(group);
        }

        if (dto.getIsActive() != null)
            menu.setIsActive(dto.getIsActive());

        return new AdminMenuResponseDTO(
            menu.getMenuId(),
            menu.getItemName(),
            menu.getPrice(),
            menu.getIsActive(),
            menu.getMenuGroup().getGroupId(),
            menu.getMenuGroup().getGroupName()
        );
    }

    // Toggle Status Active (Soft Delete)
    @Override
    @Transactional
    public void toggleMenuStatus(Integer menuId, Boolean isActive) {
        Menu menu = menuRepository.findById(menuId)
            .orElseThrow(() -> new RuntimeException("Menu not found"));
        menu.setIsActive(isActive);
    }

    // Frontend specific method for grouping items
    @Override
    @Transactional(readOnly = true)
    public List<AdminGroupedMenuDTO> getGroupedMenus(Integer shopId) {
        List<Menu> menus =
            menuRepository.findByShopId_ShopIdOrderByMenuGroup_GroupNameAscItemNameAsc(shopId);

        Map<MenuGroup, List<Menu>> grouped =
            menus.stream().collect(Collectors.groupingBy(Menu::getMenuGroup));

        return grouped.entrySet().stream()
            .map(entry -> {
                MenuGroup group = entry.getKey();
                List<Menu> groupMenus = entry.getValue();

                List<AdminGroupedMenuItemDTO> items =
                    groupMenus.stream()
                        .map(menu -> new AdminGroupedMenuItemDTO(
                            menu.getMenuId(),
                            menu.getItemName(),
                            menu.getPrice(),
                            menu.getIsActive()
                        ))
                        .toList();

                return new AdminGroupedMenuDTO(
                    group.getGroupId(),
                    group.getGroupName(),
                    items
                );
            })
            .toList();
    }

    // Move items from one group to another
    @Override
    @Transactional
    public void moveMenuItem(Integer menuId, Integer targetGroupId) {
        Menu menu = menuRepository.findById(menuId)
            .orElseThrow(() -> new RuntimeException("Menu item not found"));

        MenuGroup targetGroup = menuGroupRepository.findById(targetGroupId)
            .orElseThrow(() -> new RuntimeException("Target group not found"));

        if (!menu.getShopId().getShopId().equals(targetGroup.getShopId().getShopId())) {
            throw new RuntimeException("Cannot move menu to another shop");
        }

        menu.setMenuGroup(targetGroup);
    }

    // Delete Menu Item: Move to TRASH group and set isActive = false
    // Never hard-deletes to protect past orders and foreign keys
    @Override
    @Transactional
    public void deleteMenu(Integer menuId) {
        Menu menu = menuRepository.findById(menuId)
            .orElseThrow(() -> new RuntimeException("Menu not found with id: " + menuId));

        Shops shop = menu.getShopId();

        // Find or create TRASH group for this shop
        MenuGroup trashGroup = menuGroupRepository.findByGroupNameIgnoreCaseAndShopId("TRASH", shop)
            .or(() -> menuGroupRepository.findByGroupNameIgnoreCaseAndShopId("UNCATEGORIZED", shop))
            .orElseGet(() -> {
                MenuGroup newTrash = new MenuGroup();
                newTrash.setGroupName("TRASH");
                newTrash.setShopId(shop);
                return menuGroupRepository.save(newTrash);
            });

        // Move to TRASH group and deactivate
        menu.setMenuGroup(trashGroup);
        menu.setIsActive(false);
        menuRepository.save(menu);
    }
}
