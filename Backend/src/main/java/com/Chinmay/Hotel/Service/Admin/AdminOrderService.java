package com.Chinmay.Hotel.Service.Admin;

import java.time.LocalDateTime;
import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;

import com.Chinmay.Hotel.DTO.Admin.AdminOrderDetailsDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminOrderListDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminRevenueDTO;
import com.Chinmay.Hotel.Enums.OrderStatus;

import jakarta.servlet.http.HttpServletResponse;


public interface AdminOrderService {
    

    AdminOrderDetailsDTO getOrderDetails(Long orderId);

    void updateOrderStatus(Long orderId, OrderStatus status);

    public List<AdminOrderListDTO> getOrdersByStatus(OrderStatus status);

    AdminRevenueDTO getDailyRevenue(LocalDate date);

    AdminRevenueDTO getWeeklyRevenue(LocalDate date);

    AdminRevenueDTO getMonthlyRevenue(int year, int month);

    AdminRevenueDTO getYearlyRevenue(int year);

    AdminRevenueDTO getCustomRevenue(LocalDate fromDate, LocalDate toDate);
    
    void exportPaidOrdersToExcel(
        LocalDate from,
        LocalDate to,
        HttpServletResponse response
    );

    ByteArrayInputStream exportPaidOrdersPdf(LocalDate fromDate, LocalDate toDate);


    
}
