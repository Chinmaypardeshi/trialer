package com.Chinmay.Hotel.Service.Admin.Impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Chinmay.Hotel.DTO.Admin.TopGroupDTO;
import com.Chinmay.Hotel.DTO.Admin.TopMenuItemDTO;
import com.Chinmay.Hotel.Enums.OrderStatus;
import com.Chinmay.Hotel.Repository.OrdersRepository;
import com.Chinmay.Hotel.Service.Admin.AdminAnalyticsService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) 
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private final OrdersRepository ordersRepository;

    //Responsible for fetching Top Groups
    @Override
    public List<TopGroupDTO> getTopGroups(LocalDate from, LocalDate to) {

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);

        Pageable pageable = PageRequest.of(0,5);
        
        return ordersRepository.findTopGroups(
        OrderStatus.PAID,
        start,
        end,
        pageable
    );
    }

    //items inside Group
    @Override
    public List<TopMenuItemDTO> getTopItemsByGroup(
        Long groupId,
        LocalDate from,
        LocalDate to) {

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);

        Pageable pageable = PageRequest.of(0,10);

        return ordersRepository.findTopItemsByGroup(
        OrderStatus.PAID,
        groupId,
        start,
        end,
        pageable
    );
        
    }
}
