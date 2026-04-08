package com.Chinmay.Hotel.DTO.Admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminOrderDetailsDTO {
    
    private Long orderId;
    private LocalDateTime orderTime;
    private String shopName;
    private BigDecimal totalAmount;
    private String paymentMode;
    private String status;


    private List<AdminOrderItemDTO> items;
}
