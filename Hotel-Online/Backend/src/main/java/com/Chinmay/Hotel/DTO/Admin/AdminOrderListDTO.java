package com.Chinmay.Hotel.DTO.Admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminOrderListDTO {

    private Long orderId;
    private LocalDateTime orderTime;
    private String shopName;
    private BigDecimal totalAmount;
    private String paymentMode;
    private String status;

    
}
