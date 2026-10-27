package com.Chinmay.Hotel.DTO.Admin;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminMenuResponseDTO {

    //part of admin updation and creationg for menu items
    //used for :- List menus, show upodated item
    private Integer menuId;
    private String itemName;
    private BigDecimal price;
    private Boolean isActive;

    private Integer groupId;
    private String groupName;
    
}
