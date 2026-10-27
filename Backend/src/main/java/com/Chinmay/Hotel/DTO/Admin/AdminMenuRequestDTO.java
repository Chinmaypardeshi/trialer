package com.Chinmay.Hotel.DTO.Admin;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminMenuRequestDTO {

    
    //part of admin updation and creationg for menu items
    //Used for menu items Creation and Update
    private String itemName;
    private BigDecimal price;
    private Integer groupId;
    private Boolean isActive;
    
}
