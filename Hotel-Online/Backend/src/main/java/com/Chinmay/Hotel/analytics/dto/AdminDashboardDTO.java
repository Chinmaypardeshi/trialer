package com.Chinmay.Hotel.analytics.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {
    
    private LocalDate fromDate;
    private LocalDate toDate;
    private Integer shopId;

    private Long paidOrders;
    private Long activeOrders;
    private Long cancelledOrders;

    private BigDecimal totalRevenue;
}
