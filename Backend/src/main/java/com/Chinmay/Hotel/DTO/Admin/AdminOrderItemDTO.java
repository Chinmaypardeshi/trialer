package com.Chinmay.Hotel.DTO.Admin;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
public class AdminOrderItemDTO {

    private String itemName;
    private int quantity;
    private BigDecimal price;
    private BigDecimal totalPrice;
    
}
