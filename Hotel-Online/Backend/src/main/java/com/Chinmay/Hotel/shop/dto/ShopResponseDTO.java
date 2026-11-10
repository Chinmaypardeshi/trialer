package com.Chinmay.Hotel.shop.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShopResponseDTO {
    private Integer shopId;
    private String shopName;
    private String location;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private long totalDishes;
    private long totalGroups;
    private long totalOrders;
}
