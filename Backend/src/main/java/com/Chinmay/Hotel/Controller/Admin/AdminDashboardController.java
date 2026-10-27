package com.Chinmay.Hotel.Controller.Admin;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Chinmay.Hotel.DTO.Admin.AdminDashboardDTO;
import com.Chinmay.Hotel.Service.Admin.AdminDashboardService;

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
        LocalDate toDate 
    ) {
        return adminDashboardService.getDashboardData(fromDate, toDate);
    }


    
    
}
