package com.Chinmay.Hotel.DTO.Admin;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
//Menu items inside a group
public class AdminGroupedMenuItemDTO {
    
    private Integer menuId;
    private String itemName;
    private BigDecimal price;
    private Boolean isActive;
}
