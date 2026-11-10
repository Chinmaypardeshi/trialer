package com.Chinmay.Hotel.order.dto;

import com.Chinmay.Hotel.common.enums.OrderStatus;

import lombok.Data;

@Data
public class UpdateOrderStatusDTO {
    private OrderStatus status;
}
