package com.Chinmay.Hotel.Controller.Admin;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Chinmay.Hotel.Service.Admin.AdminOrderPdfService;
import com.Chinmay.Hotel.Service.Admin.AdminOrderService;

import jakarta.servlet.http.HttpServletResponse;

import com.Chinmay.Hotel.DTO.Admin.AdminOrderDetailsDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminOrderListDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminRevenueDTO;
import com.Chinmay.Hotel.DTO.Admin.UpdateOrderStatusDTO;

import com.Chinmay.Hotel.Enums.OrderStatus;

import lombok.RequiredArgsConstructor;

@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    //1. List all orders based on status
    @GetMapping
    public List<AdminOrderListDTO> getOrders(
        @RequestParam(required = false) OrderStatus status
    ) {
        return adminOrderService.getOrdersByStatus(status);
    }
    
    //2. Order details (click on one order at a time)
    @GetMapping("/{orderId}")
    public AdminOrderDetailsDTO getOrderDetails(@PathVariable Long orderId){
    return adminOrderService.getOrderDetails(orderId);
    }

    //3. Api for updating order status paid/cancelled
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<String> updateStatus(
        @PathVariable Long orderId,
        @RequestBody UpdateOrderStatusDTO dto) {

            adminOrderService.updateOrderStatus(orderId, dto.getStatus());
            return ResponseEntity.ok("Order status updated successfully");
        }

    //4. Daily Revenue Report
    @GetMapping("/revenue/daily")
    public AdminRevenueDTO getDailyRevenue(
        @RequestParam LocalDate date
    ) {
        return adminOrderService.getDailyRevenue(date);
    }

    //5. Weekly Revenue Report
    @GetMapping("/revenue/weekly")
    public AdminRevenueDTO getWeeklyRevenue(
        @RequestParam LocalDate date
    ) {
        return adminOrderService.getWeeklyRevenue(date);
    }

    //6. Monthly Revenue Report
    @GetMapping("/revenue/monthly")
    public AdminRevenueDTO getMonthlyRevenue(
        @RequestParam int year,
        @RequestParam int month
    ) {
        return adminOrderService.getMonthlyRevenue(year, month);
    }

    //7. Yearly Revenue Report
    @GetMapping("/revenue/yearly")
    public AdminRevenueDTO getYearlyRevenue(
        @RequestParam int year
    ) {
        return adminOrderService.getYearlyRevenue(year);
    }

    //8. Custom Revenue Report
    @GetMapping("/revenue/custom")
    public AdminRevenueDTO getCustomRevenue(
        @RequestParam LocalDate fromDate,
        @RequestParam LocalDate toDate
    ) {
        return adminOrderService.getCustomRevenue(fromDate, toDate);
    }

    //8. Export excel file
    @GetMapping("/export/excel")
    public void exportOrderToExcel(
        @RequestParam LocalDate from,
        @RequestParam LocalDate to,
        HttpServletResponse response
    ) {
        adminOrderService.exportPaidOrdersToExcel(from,to,response);
    }


    //9.PDF Export
    @GetMapping("/test")
public ResponseEntity<InputStreamResource> exportPdf(
        @RequestParam LocalDate fromDate,
        @RequestParam LocalDate toDate
) {

    ByteArrayInputStream pdf =
            adminOrderService.exportPaidOrdersPdf(fromDate, toDate);

    HttpHeaders headers = new HttpHeaders();
    headers.add("Content-Disposition", "inline; filename=paid-orders.pdf");

    return ResponseEntity.ok()
            .headers(headers)
            .contentType(MediaType.APPLICATION_PDF)
            .body(new InputStreamResource(pdf));
}




}
