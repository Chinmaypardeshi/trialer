package com.Chinmay.Hotel.analytics.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Chinmay.Hotel.analytics.dto.AdminDashboardDTO;
import com.Chinmay.Hotel.analytics.service.AdminDashboardService;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {
    
    private final AdminDashboardService adminDashboardService;

    @GetMapping
    public AdminDashboardDTO getDashboardData(
        @RequestParam
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate fromDate,

        @RequestParam
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate toDate,

        @RequestParam(required = false)
        Integer shopId
    ) {
        return adminDashboardService.getDashboardData(fromDate, toDate, shopId);
    }
}
