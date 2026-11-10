package com.Chinmay.Hotel.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShopRequestDTO {
    private String shopName;
    private String location;
    private Boolean isActive;
    private String adminPassword;
}
