package com.Chinmay.Hotel.DTO.Admin;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminDashboardDTO {
    
    private LocalDate fromDate;
    private LocalDate toDate;

    private Long paidOrders;
    private Long activeOrders;
    private Long cancelledOrders;

    private BigDecimal totalRevenue;
}
