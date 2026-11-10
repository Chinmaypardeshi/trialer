package com.Chinmay.Hotel.salary;

import com.Chinmay.Hotel.salary.dto.SalaryCertificateRequestDTO;
import com.Chinmay.Hotel.salary.dto.SalaryComponentDTO;
import com.Chinmay.Hotel.salary.service.AdminSalaryCertificateService;
import com.Chinmay.Hotel.salary.service.impl.AdminSalaryCertificateServiceImpl;
import com.Chinmay.Hotel.salary.util.IndianNumberToWords;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AdminSalaryCertificateServiceTest {

    private AdminSalaryCertificateService service;

    @BeforeEach
    void setUp() {
        service = new AdminSalaryCertificateServiceImpl();
    }

    @Test
    @DisplayName("Test Indian number to words conversion")
    void testIndianNumberToWords() {
        assertEquals("Thirty Thousand Rupees Only",
                IndianNumberToWords.convertToIndianCurrencyWords(new BigDecimal("30000")));

        assertEquals("Zero Rupees Only",
                IndianNumberToWords.convertToIndianCurrencyWords(BigDecimal.ZERO));

        assertEquals("One Lakh Fifty Thousand Rupees Only",
                IndianNumberToWords.convertToIndianCurrencyWords(new BigDecimal("150000")));

        assertEquals("Twenty Five Lakh Rupees Only",
                IndianNumberToWords.convertToIndianCurrencyWords(new BigDecimal("2500000")));

        assertEquals("One Crore Rupees Only",
                IndianNumberToWords.convertToIndianCurrencyWords(new BigDecimal("10000000")));

        assertEquals("Thirty Thousand Rupees and Fifty Paise Only",
                IndianNumberToWords.convertToIndianCurrencyWords(new BigDecimal("30000.50")));
    }

    @Test
    @DisplayName("Generate PDF certificate with default single component")
    void testGenerateSalaryCertificatePdfDefault() {
        SalaryCertificateRequestDTO request = SalaryCertificateRequestDTO.builder()
                .employeeName("Mr. Ganesh Vishwanath Rampure")
                .joiningDateOrYear("2026")
                .monthlyGrossSalary(new BigDecimal("30000"))
                .issueDate(LocalDate.of(2026, 7, 1))
                .purpose("official purposes")
                .build();

        ByteArrayInputStream stream = service.generateSalaryCertificatePdf(request);
        assertNotNull(stream);

        byte[] pdfBytes = stream.readAllBytes();
        assertTrue(pdfBytes.length > 1000, "PDF should be generated with valid content size");

        // Verify PDF Magic Bytes (%PDF-)
        String header = new String(pdfBytes, 0, 5);
        assertEquals("%PDF-", header, "Should start with valid PDF header");
    }

    @Test
    @DisplayName("Generate PDF certificate with multi-component salary breakdown")
    void testGenerateSalaryCertificatePdfWithBreakdown() {
        SalaryCertificateRequestDTO request = SalaryCertificateRequestDTO.builder()
                .employeeName("Ms. Priya Sharma")
                .joiningDateOrYear("15-08-2023")
                .monthlyGrossSalary(new BigDecimal("45000"))
                .issueDate(LocalDate.of(2026, 11, 9))
                .purpose("bank loan application")
                .components(List.of(
                        new SalaryComponentDTO("Basic Salary", new BigDecimal("25000")),
                        new SalaryComponentDTO("House Rent Allowance (HRA)", new BigDecimal("12000")),
                        new SalaryComponentDTO("Special Allowance", new BigDecimal("8000"))
                ))
                .build();

        ByteArrayInputStream stream = service.generateSalaryCertificatePdf(request);
        assertNotNull(stream);

        byte[] pdfBytes = stream.readAllBytes();
        assertTrue(pdfBytes.length > 1000);

        String header = new String(pdfBytes, 0, 5);
        assertEquals("%PDF-", header);
    }

    @Test
    @DisplayName("Generate PDF with user screenshot payload")
    void testUserScreenshotPayload() {
        SalaryCertificateRequestDTO request = SalaryCertificateRequestDTO.builder()
                .employeeName("Dakksh")
                .joiningDateOrYear("2027")
                .monthlyGrossSalary(new BigDecimal("1271240"))
                .issueDate(LocalDate.of(2026, 11, 9))
                .purpose("Loan")
                .designation("Manager")
                .components(List.of(
                        new SalaryComponentDTO("Basic Salary", new BigDecimal("1245474")),
                        new SalaryComponentDTO("Travel Allowance", new BigDecimal("23424")),
                        new SalaryComponentDTO("Eating Allowance", new BigDecimal("2342"))
                ))
                .build();

        ByteArrayInputStream stream = service.generateSalaryCertificatePdf(request);
        assertNotNull(stream);
        byte[] pdfBytes = stream.readAllBytes();
        assertTrue(pdfBytes.length > 1000);
        assertEquals("%PDF-", new String(pdfBytes, 0, 5));
    }
}
