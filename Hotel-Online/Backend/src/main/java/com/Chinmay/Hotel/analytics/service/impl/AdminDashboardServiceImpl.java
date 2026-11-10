package com.Chinmay.Hotel.analytics.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Chinmay.Hotel.analytics.dto.AdminDashboardDTO;
import com.Chinmay.Hotel.analytics.service.AdminDashboardService;
import com.Chinmay.Hotel.common.enums.OrderStatus;
import com.Chinmay.Hotel.order.repository.OrdersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final OrdersRepository ordersRepository;

    @Override
    public AdminDashboardDTO getDashboardData(
        LocalDate fromDate,
        LocalDate toDate,
        Integer shopId
    ) {
        LocalDateTime start = fromDate.atStartOfDay();
        LocalDateTime end = toDate.atTime(LocalTime.MAX);

        Long paidOrders = ordersRepository.countOrdersByStatusAndShop(
            OrderStatus.PAID, start, end, shopId
        );

        Long activeOrders = ordersRepository.countOrdersByStatusAndShop(
            OrderStatus.ACTIVE, start, end, shopId
        );

        Long cancelledOrders = ordersRepository.countOrdersByStatusAndShop(
            OrderStatus.CANCELLED, start, end, shopId
        );

        BigDecimal totalRevenue = ordersRepository.calculateRevenueByShop(
            OrderStatus.PAID, start, end, shopId
        );

        return new AdminDashboardDTO(
            fromDate,
            toDate,
            shopId,
            paidOrders,
            activeOrders,
            cancelledOrders,
            totalRevenue
        );
    }
}
