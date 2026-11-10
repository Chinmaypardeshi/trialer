package com.Chinmay.Hotel.menu.service;
import java.util.List;

import com.Chinmay.Hotel.menu.dto.AdminGroupedMenuDTO;
import com.Chinmay.Hotel.menu.dto.AdminMenuGroupDTO;
import com.Chinmay.Hotel.menu.dto.AdminMenuRequestDTO;
import com.Chinmay.Hotel.menu.dto.AdminMenuResponseDTO;

public interface AdminMenuService {

    //Get MEnu list
    List<AdminMenuResponseDTO> getAllMenus(Integer shopId);

    //Add menu item
    AdminMenuResponseDTO addMenu(Integer shopId, AdminMenuRequestDTO dto);

    //Update exisitng menu
    AdminMenuResponseDTO updateMenu(Integer menuId, AdminMenuRequestDTO dto);

    //See menu status
    void toggleMenuStatus(Integer menuId, Boolean isActive);


    //Grouping menu items in group 
    //this service is created to solve the error of groupid where even after entering groupid one it returns all menu items fro mall groups instead of that specific group
    //Group menu items
    //frontend specific method 
    List<AdminGroupedMenuDTO> getGroupedMenus(Integer shopId);


    void moveMenuItem(Integer menuId, Integer targetGroupId);

    //Delete menu item
    void deleteMenu(Integer menuId);

}
