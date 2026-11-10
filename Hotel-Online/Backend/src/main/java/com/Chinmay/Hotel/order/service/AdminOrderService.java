package com.Chinmay.Hotel.order.service;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;

import com.Chinmay.Hotel.order.dto.AdminOrderDetailsDTO;
import com.Chinmay.Hotel.order.dto.AdminOrderListDTO;
import com.Chinmay.Hotel.order.dto.AdminOrderPageDTO;
import com.Chinmay.Hotel.order.dto.AdminRevenueDTO;
import com.Chinmay.Hotel.common.enums.OrderStatus;

import jakarta.servlet.http.HttpServletResponse;

public interface AdminOrderService {

    AdminOrderDetailsDTO getOrderDetails(Long orderId);

    void updateOrderStatus(Long orderId, OrderStatus status);

    List<AdminOrderListDTO> getOrdersByStatus(OrderStatus status);

    AdminOrderPageDTO getOrdersPaged(
        OrderStatus status,
        int page,
        int size,
        String sortDirection,
        LocalDate fromDate,
        LocalDate toDate
    );

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
