package com.Chinmay.Hotel.DTO.Admin;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopMenuItemDTO {

    private Integer itemId;
    private String itemName;
    private Long totalQuantity;
    
}
