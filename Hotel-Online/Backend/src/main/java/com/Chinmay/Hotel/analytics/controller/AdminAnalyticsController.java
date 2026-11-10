package com.Chinmay.Hotel.analytics.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Chinmay.Hotel.analytics.dto.TopGroupDTO;
import com.Chinmay.Hotel.analytics.dto.TopMenuItemDTO;
import com.Chinmay.Hotel.analytics.service.AdminAnalyticsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    // 1. MOST ORDERED GROUPS (Dates & Shop are optional, defaults to All Time / All Shops)
    @GetMapping("/top-groups")
    public List<TopGroupDTO> getTopGroups(
        @RequestParam(required = false) Integer shopId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        LocalDate start = (fromDate != null) ? fromDate : LocalDate.of(2020, 1, 1);
        LocalDate end = (toDate != null) ? toDate : LocalDate.of(2035, 12, 31);
        return adminAnalyticsService.getTopGroups(shopId, start, end);
    }

    // 2. MOST ORDERED ITEMS INSIDE A GROUP (Dates are optional, defaults to All Time)
    @GetMapping("/top-items/{groupId}/items")
    public List<TopMenuItemDTO> getTopItemsByGroup(
        @PathVariable Long groupId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        LocalDate start = (fromDate != null) ? fromDate : LocalDate.of(2020, 1, 1);
        LocalDate end = (toDate != null) ? toDate : LocalDate.of(2035, 12, 31);
        return adminAnalyticsService.getTopItemsByGroup(groupId, start, end);
    }
}
