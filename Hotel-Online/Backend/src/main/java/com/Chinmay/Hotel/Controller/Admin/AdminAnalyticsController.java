package com.Chinmay.Hotel.Controller.Admin;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Chinmay.Hotel.DTO.Admin.TopGroupDTO;
import com.Chinmay.Hotel.DTO.Admin.TopMenuItemDTO;
import com.Chinmay.Hotel.Service.Admin.AdminAnalyticsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    //1. MOST ORDERED GROUPS
    @GetMapping("/top-groups")
    public List<TopGroupDTO> getTopGroups(
        @RequestParam LocalDate fromDate,
        @RequestParam LocalDate toDate
    ) {
        return adminAnalyticsService.getTopGroups(fromDate, toDate);
    }


    //2. MOST ORDERED ITEMS INSIDE A GROUP
    @GetMapping("/top-items/{groupId}/items")
    public List<TopMenuItemDTO> getTopItemsByGroup(
        @PathVariable Long groupId,
        @RequestParam LocalDate fromDate,
        @RequestParam LocalDate toDate
    ) {
        return adminAnalyticsService.getTopItemsByGroup(
            groupId, fromDate, toDate
        );
    }
}
