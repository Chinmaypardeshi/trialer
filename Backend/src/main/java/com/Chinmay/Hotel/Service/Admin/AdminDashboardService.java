package com.Chinmay.Hotel.Service.Admin;

import java.time.LocalDate;

import com.Chinmay.Hotel.DTO.Admin.AdminDashboardDTO;

public interface AdminDashboardService {
    
    AdminDashboardDTO getDashboardData (
        LocalDate fromDate,
        LocalDate toDate
    );
}
