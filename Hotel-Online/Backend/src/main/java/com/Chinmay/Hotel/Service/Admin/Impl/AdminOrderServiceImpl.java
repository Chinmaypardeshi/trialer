package com.Chinmay.Hotel.Service.Admin.Impl;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Chinmay.Hotel.DTO.Admin.AdminOrderDetailsDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminOrderItemDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminOrderListDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminRevenueDTO;
import com.Chinmay.Hotel.Entity.Orders;
import com.Chinmay.Hotel.Enums.OrderStatus;
import com.Chinmay.Hotel.Repository.OrdersRepository;
import com.Chinmay.Hotel.Service.Admin.AdminOrderPdfService;
import com.Chinmay.Hotel.Service.Admin.AdminOrderService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminOrderServiceImpl implements AdminOrderService {

    private final OrdersRepository ordersRepository;

    // ORDER LIST 
    @Override 
    @Transactional(readOnly = true)
    public List<AdminOrderListDTO> getOrdersByStatus(OrderStatus status) {
        
        List<Orders> orders;

        if(status == null){
            orders = ordersRepository.findAll();
        } else {
            orders = ordersRepository.findByStatusOrderByOrderTimeAsc(status);
        }

        return orders.stream()
            .map(order -> new AdminOrderListDTO(
                order.getOrderId(),
                order.getOrderTime(),
                order.getShop().getShopName(),
                order.getTotalAmount(),
                order.getModeOfPayment() == null ? "PENDING" : order.getModeOfPayment().name(),
                order.getStatus().name()
            ))
            .toList();
        
    }


    //ORDER DETAIL (NEW - when admin clicks an order)
    @Override
    @Transactional(readOnly = true)
    public AdminOrderDetailsDTO getOrderDetails(Long orderId){
        
        Orders order = ordersRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

            List<AdminOrderItemDTO> items = order.getOrderItems()
            .stream()
            .map(item -> new AdminOrderItemDTO(
                item.getMenuItem().getItemName(),
                item.getQuantity(),
                item.getPriceAtPurchase(),
                item.getPriceAtPurchase().multiply(
                    BigDecimal.valueOf(item.getQuantity())
                )
            ))
            .toList();

        return new AdminOrderDetailsDTO(
            order.getOrderId(),
            order.getOrderTime(),
            order.getShop().getShopName(),
            order.getTotalAmount(),
            order.getModeOfPayment() == null ? "PENDING" : order.getModeOfPayment().name(),
            order.getStatus().name(),
            items
        );
    }

    @Transactional
    public void updateOrderStatus(Long orderId, OrderStatus newStatus){

        Orders order = ordersRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        //Prevent illegal updates 
        if(order.getStatus() == OrderStatus.PAID || 
           order.getStatus() == OrderStatus.CANCELLED){
            throw new RuntimeException("Cannot update order status");
        }

        order.setStatus(newStatus);
        ordersRepository.save(order);
    }
    
    @Transactional(readOnly = true)
    public AdminRevenueDTO getDailyRevenue(LocalDate date){

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        return ordersRepository.calculateDailyRevenue(
            OrderStatus.PAID,
            start,
            end,
            date,
            date
        );
    }

    @Transactional(readOnly = true)
    public AdminRevenueDTO getWeeklyRevenue(LocalDate date) {

        LocalDate startDate = date.with(DayOfWeek.MONDAY);
        LocalDate endDate = startDate.plusDays(6);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);


    return ordersRepository.calculateWeeklyRevenue(
        OrderStatus.PAID,
        start,
        end,
        startDate,
        endDate
    );
    }

    @Transactional(readOnly = true)
    public AdminRevenueDTO getMonthlyRevenue(int year, int month){

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        return ordersRepository.calculateMonthlyRevenue(
            OrderStatus.PAID,
            start,
            end,
            startDate,
            endDate
        );
    }

    @Transactional(readOnly = true)
    public AdminRevenueDTO getYearlyRevenue(int year){

        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        return ordersRepository.calculateYearlyRevenue(
            OrderStatus.PAID,
            start,
            end,
            startDate,
            endDate
        );
    }

    @Transactional(readOnly = true)
    public AdminRevenueDTO getCustomRevenue(LocalDate fromDate, LocalDate toDate){

        if (fromDate.isAfter(toDate)){
            throw new RuntimeException("From date cannot be after To date");
        }
        
        LocalDateTime start = fromDate.atStartOfDay();
        LocalDateTime end = toDate.atTime(LocalTime.MAX);

        return ordersRepository.calculateCustomRevenue(
            OrderStatus.PAID,
            start,
            end,
            fromDate,
            toDate
        );
    }


    @Transactional(readOnly = true)
    public void exportPaidOrdersToExcel(
        LocalDate from,
        LocalDate to,
        HttpServletResponse response) {


        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);

        List<Orders> orders = ordersRepository.findPaidOrdersForExcel(
            OrderStatus.PAID,
            start,
            end
        );



        try (Workbook workbook = new XSSFWorkbook()){

            Sheet sheet = workbook.createSheet("Paid Orders");

            //Header Row
            Row header = sheet.createRow(0);
            String[] columns = {
                "Order ID",
                "Order Time",
                "Payment Time",
                "Total Amount",
                "Mode of Payment",
                "Shop Name"                
            };

            for (int i = 0; i < columns.length; i++){
                header.createCell(i).setCellValue(columns[i]);
            }


            int rowIdx = 1;
            for(Orders order : orders){
                Row row = sheet.createRow(rowIdx++);

                //Order Id column
                row.createCell(0).setCellValue(order.getOrderId());
                //Order Time column
                row.createCell(1).setCellValue(order.getOrderTime().toString());
                //Payment Time column
                row.createCell(2).setCellValue(
                    order.getPaymentTime() == null ? "-" : order.getPaymentTime().toString()
                );
                //Total Amount column
                row.createCell(3).setCellValue(order.getTotalAmount().doubleValue());
                //Mode of Payment column
                row.createCell(4).setCellValue(
                    order.getModeOfPayment() == null ? "PENDING" : order.getModeOfPayment().name()
                );
                //Shop Name column
                row.createCell(5).setCellValue(order.getShop().getShopName());        

            }

            //Auto-size columns
            for(int i = 0; i < columns.length; i++){
                sheet.autoSizeColumn(i);
            }

            //Response setup
            response.setContentType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            response.setHeader(
                "Content-Disposition",
                "attachment; filename=orders.xlsx"
            );

            workbook.write(response.getOutputStream());

        } catch (Exception e) {
            throw new RuntimeException("Failed to export Excel file", e);
        }

        

    }

    private final AdminOrderPdfService adminOrderPdfService;
    @Override
    public ByteArrayInputStream exportPaidOrdersPdf(LocalDate fromDate, LocalDate toDate) {
        return adminOrderPdfService.exportPaidOrdersPdf(fromDate, toDate);

    }






    
    
}
