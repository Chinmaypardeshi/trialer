package com.Chinmay.Hotel.Service.Admin;

import org.openpdf.text.*;
import org.openpdf.text.pdf.*;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import com.Chinmay.Hotel.DTO.Admin.AdminRevenueDTO;
import com.Chinmay.Hotel.Entity.Orders;
import com.Chinmay.Hotel.Enums.OrderStatus;
import com.Chinmay.Hotel.Repository.OrdersRepository;


@Service
@RequiredArgsConstructor
public class AdminOrderPdfService {

    private final OrdersRepository ordersRepository;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public ByteArrayInputStream exportPaidOrdersPdf(LocalDate fromDate, LocalDate toDate) {
    LocalDateTime start = fromDate.atStartOfDay();
    LocalDateTime end = toDate.atTime(LocalTime.MAX);

    List<Orders> orders =
        ordersRepository.findByStatusAndPaymentTimeBetweenOrderByPaymentTimeAsc(
            OrderStatus.PAID, start, end
        );

    AdminRevenueDTO revenue =
        ordersRepository.calculateRevenueBetween(
            OrderStatus.PAID,
            start,
            end,
            fromDate,
            toDate
        );

    Document document = new Document();
    ByteArrayOutputStream out = new ByteArrayOutputStream();

    try {
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

        document.add(new Paragraph("Paid Orders Revenue Report", titleFont));
        document.add(new Paragraph("From: " + fromDate + "  To: " + toDate, normalFont));
        document.add(new Paragraph(" ", normalFont));

        document.add(new Paragraph("Total Paid Orders: " + revenue.getTotalOrders(), boldFont));
        document.add(new Paragraph("Total Revenue: " + revenue.getTotalRevenue(), boldFont));
        document.add(new Paragraph(" ", normalFont));

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);

        addTableHeader(table);
        addTableData(table, orders);

        document.add(table);
        document.close();

    } catch (DocumentException e) {
        throw new RuntimeException("PDF generation failed", e);
    }

    return new ByteArrayInputStream(out.toByteArray());
}

    private void addTableHeader(PdfPTable table) {
        Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);

        String[] headers = {
                "Order ID",
                "Order Date",
                "Payment Date",
                "Payment Mode",
                "Total Amount"
        };

        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headFont));
            cell.setBackgroundColor(Color.LIGHT_GRAY);
            cell.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
            table.addCell(cell);
        }
    }

    private void addTableData(PdfPTable table, List<Orders> orders) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    for (Orders order : orders) {
        table.addCell(order.getOrderId().toString());

        table.addCell(order.getOrderTime() == null
            ? "-"
            : order.getOrderTime().format(formatter)
        );

        table.addCell(order.getPaymentTime() == null
            ? "-"
            : order.getPaymentTime().format(formatter)
        );

        table.addCell(order.getModeOfPayment() == null
            ? "-"
            : order.getModeOfPayment().name()
        );

        table.addCell(order.getTotalAmount() == null
            ? "0"
            : order.getTotalAmount().toString()
        );
    }
}
    
}
