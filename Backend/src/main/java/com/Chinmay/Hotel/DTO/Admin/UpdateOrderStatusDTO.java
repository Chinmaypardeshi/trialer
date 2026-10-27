package com.Chinmay.Hotel.DTO.Admin;

import com.Chinmay.Hotel.Enums.OrderStatus;

import lombok.Data;

@Data
public class UpdateOrderStatusDTO {
    private OrderStatus status;
}
