package com.Chinmay.Hotel.analytics.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Chinmay.Hotel.analytics.dto.TopGroupDTO;
import com.Chinmay.Hotel.analytics.dto.TopMenuItemDTO;
import com.Chinmay.Hotel.analytics.service.AdminAnalyticsService;
import com.Chinmay.Hotel.common.enums.OrderStatus;
import com.Chinmay.Hotel.order.repository.OrdersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private final OrdersRepository ordersRepository;

    // Responsible for fetching Top Groups (up to 50 groups)
    @Override
    public List<TopGroupDTO> getTopGroups(Integer shopId, LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);

        Pageable pageable = PageRequest.of(0, 50);

        if (shopId != null && shopId > 0) {
            return ordersRepository.findTopGroupsByShop(
                OrderStatus.PAID,
                shopId,
                start,
                end,
                pageable
            );
        }

        return ordersRepository.findTopGroups(
            OrderStatus.PAID,
            start,
            end,
            pageable
        );
    }

    // Items inside Group (up to 100 items)
    @Override
    public List<TopMenuItemDTO> getTopItemsByGroup(
        Long groupId,
        LocalDate from,
        LocalDate to
    ) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);

        Pageable pageable = PageRequest.of(0, 100);

        return ordersRepository.findTopItemsByGroup(
            OrderStatus.PAID,
            groupId,
            start,
            end,
            pageable
        );
    }
}
