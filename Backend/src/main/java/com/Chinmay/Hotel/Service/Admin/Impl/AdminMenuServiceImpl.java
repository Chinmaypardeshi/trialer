package com.Chinmay.Hotel.Service.Admin.Impl;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Chinmay.Hotel.DTO.Admin.AdminGroupedMenuDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminGroupedMenuItemDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminMenuGroupDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminMenuRequestDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminMenuResponseDTO;
import com.Chinmay.Hotel.Entity.Menu;
import com.Chinmay.Hotel.Entity.MenuGroup;
import com.Chinmay.Hotel.Repository.MenuRepository;
import com.Chinmay.Hotel.Service.Admin.AdminMenuService;
import lombok.RequiredArgsConstructor;
import com.Chinmay.Hotel.Repository.MenuGroupRepository;


@Service
@RequiredArgsConstructor
public class AdminMenuServiceImpl implements AdminMenuService {

    private final MenuRepository menuRepository;
    private final MenuGroupRepository menuGroupRepository;

    //Admin CRUD

    //Get All Menus(By Shop)
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


    //Add Menu Item
    @Override
    @Transactional
    public AdminMenuResponseDTO addMenu(Integer shopId, AdminMenuRequestDTO dto) {

        MenuGroup group = menuGroupRepository.findById(dto.getGroupId())
            .orElseThrow(() -> new RuntimeException("Group not found"));

    // ✅ Duplicate check
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

    //Update Menu Item
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

    //Toggle Status Active(Soft Delete)
    @Override
    @Transactional
    public void toggleMenuStatus(Integer menuId, Boolean isActive) {

    Menu menu = menuRepository.findById(menuId)
        .orElseThrow(() -> new RuntimeException("Menu not found"));

    menu.setIsActive(isActive);
}


    //frontend specific method for grouping items
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


//Move items from one group to another using drag and drop method
 @Override
 @Transactional
 public void moveMenuItem(Integer menuId, Integer targetGroupId){

    Menu menu = menuRepository.findById(menuId)
        .orElseThrow(() -> new RuntimeException("Menu item not found"));
    
    MenuGroup targetGroup = menuGroupRepository.findById(targetGroupId)
        .orElseThrow(() -> new RuntimeException("Target group not found"));

    //Optional safety: the selected menu item should be inside the same shop and not shifted to another shop this maintains integirty 
    if(!menu.getShopId().getShopId().equals(
        targetGroup.getShopId().getShopId())) {
            throw new RuntimeException("Cannot move menu to another shop");
        }

        menu.setMenuGroup(targetGroup);
        //you dont need to save every time changes happens in database jpa stores autocmaticallt this is called jpa dirty checking
 }



    
}
