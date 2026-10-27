package com.Chinmay.Hotel.DTO.Admin;

import java.math.BigDecimal;
import java.time.LocalDate;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminRevenueDTO {
    private LocalDate fromDate;
    private LocalDate toDate;
    private Long totalOrders;
    private BigDecimal totalRevenue;
}
