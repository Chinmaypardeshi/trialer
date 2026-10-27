package com.Chinmay.Hotel.Service.Admin;

import java.time.LocalDate;
import java.util.List;

import com.Chinmay.Hotel.DTO.Admin.TopGroupDTO;
import com.Chinmay.Hotel.DTO.Admin.TopMenuItemDTO;

public interface AdminAnalyticsService {
    
    List<TopGroupDTO> getTopGroups(
        LocalDate fromDate,
        LocalDate toDate
    );

    List<TopMenuItemDTO> getTopItemsByGroup(
        Long groupId,
        LocalDate fromDate,
        LocalDate toDate
    );
}
