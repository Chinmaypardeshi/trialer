package com.Chinmay.Hotel.order.dto;

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
