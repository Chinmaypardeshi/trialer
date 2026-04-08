package com.Chinmay.Hotel.Service.Admin.Impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Chinmay.Hotel.DTO.Admin.AdminMenuGroupRequestDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminMenuGroupResponseDTO;
import com.Chinmay.Hotel.Entity.Menu;
import com.Chinmay.Hotel.Entity.MenuGroup;
import com.Chinmay.Hotel.Repository.MenuGroupRepository;
import com.Chinmay.Hotel.Repository.MenuRepository;
import com.Chinmay.Hotel.Repository.ShopsRepository;
import com.Chinmay.Hotel.Service.Admin.AdminMenuGroupService;

import lombok.RequiredArgsConstructor;

//connected with adminmenugroupservice, from that you can see what is connected with it 
@RequiredArgsConstructor
@Service
@Transactional
public class AdminMenuGroupServiceImpl implements AdminMenuGroupService {
    
    private final MenuGroupRepository menuGroupRepository;
    private final ShopsRepository shopsRepository;
    private final MenuRepository menuRepository;

    //get all groups
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


    //create a group 
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

    //rename a group
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

    //Delete a group cascading style
    @Override
    public void deleteGroup(Integer groupId){
        MenuGroup group = menuGroupRepository.findById(groupId)
        .orElseThrow(() -> new RuntimeException("Group not found"));

        if (group.getGroupName().equalsIgnoreCase("UNCATEGORIZED")) {
        throw new RuntimeException("Default group cannot be deleted");
        }

        MenuGroup uncategorized = menuGroupRepository
            .findByGroupNameAndShopId("UNCATEGORIZED", group.getShopId())
            .orElseThrow(() -> new RuntimeException("Default group missing"));

        // 🔁 Move all menu items
        List<Menu> menus = menuRepository.findByMenuGroup(group);
        for (Menu menu : menus) {
            menu.setMenuGroup(uncategorized);
        }

        // 🗑️ Delete group safely
        menuGroupRepository.delete(group);
        
        //cascade deletes menu item
    }

}
