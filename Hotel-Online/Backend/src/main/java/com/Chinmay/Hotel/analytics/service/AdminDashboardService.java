package com.Chinmay.Hotel.analytics.service;

import java.time.LocalDate;
import com.Chinmay.Hotel.analytics.dto.AdminDashboardDTO;

public interface AdminDashboardService {
    
    AdminDashboardDTO getDashboardData (
        LocalDate fromDate,
        LocalDate toDate,
        Integer shopId
    );
}
