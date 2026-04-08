package com.Chinmay.Hotel.Service.Admin.Impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Chinmay.Hotel.DTO.Admin.AdminDashboardDTO;
import com.Chinmay.Hotel.Enums.OrderStatus;
import com.Chinmay.Hotel.Repository.OrdersRepository;
import com.Chinmay.Hotel.Service.Admin.AdminDashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService{

    private final OrdersRepository ordersRepository;

    @Override
    public AdminDashboardDTO getDashboardData(
        LocalDate fromDate,
        LocalDate toDate
    ) {
        
        LocalDateTime start = fromDate.atStartOfDay();
        LocalDateTime end = toDate.atTime(LocalTime.MAX);

        Long paidOrders = ordersRepository.countOrdersByStatus(
            OrderStatus.PAID, start, end
        );

        Long activeOrders = ordersRepository.countOrdersByStatus(
            OrderStatus.ACTIVE, start, end
        );

        Long cancelledOrders = ordersRepository.countOrdersByStatus(
            OrderStatus.CANCELLED, start, end
        );

        BigDecimal totalRevenue = ordersRepository.calculateRevenue(
            OrderStatus.PAID, start, end
        );

        return new AdminDashboardDTO(
            fromDate,
            toDate,
            paidOrders,
            activeOrders,
            cancelledOrders,
            totalRevenue
        );
    }
}
