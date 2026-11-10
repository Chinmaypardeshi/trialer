package com.Chinmay.Hotel.analytics.service;

import java.time.LocalDate;
import java.util.List;

import com.Chinmay.Hotel.analytics.dto.TopGroupDTO;
import com.Chinmay.Hotel.analytics.dto.TopMenuItemDTO;

public interface AdminAnalyticsService {
    
    List<TopGroupDTO> getTopGroups(
        Integer shopId,
        LocalDate fromDate,
        LocalDate toDate
    );

    List<TopMenuItemDTO> getTopItemsByGroup(
        Long groupId,
        LocalDate fromDate,
        LocalDate toDate
    );
}
