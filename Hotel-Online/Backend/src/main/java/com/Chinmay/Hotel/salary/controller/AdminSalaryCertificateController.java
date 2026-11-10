package com.Chinmay.Hotel.salary.controller;

import com.Chinmay.Hotel.salary.dto.SalaryCertificateRequestDTO;
import com.Chinmay.Hotel.salary.service.AdminSalaryCertificateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/salary-certificate")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminSalaryCertificateController {

    private final AdminSalaryCertificateService salaryCertificateService;

    @PostMapping(value = "/generate", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<InputStreamResource> generateCertificate(
            @Valid @RequestBody SalaryCertificateRequestDTO request) {

        log.info("Generating salary certificate for employee: {}", request.getEmployeeName());

        ByteArrayInputStream pdfStream = salaryCertificateService.generateSalaryCertificatePdf(request);

        String sanitizedName = request.getEmployeeName() != null
                ? request.getEmployeeName().replaceAll("[^a-zA-Z0-9_-]", "_")
                : "Employee";
        String filename = "Salary_Certificate_" + sanitizedName + ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
        headers.add(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
        headers.add(HttpHeaders.PRAGMA, "no-cache");
        headers.add(HttpHeaders.EXPIRES, "0");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdfStream));
    }

    @PostMapping(value = "/preview", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<InputStreamResource> previewCertificate(
            @Valid @RequestBody SalaryCertificateRequestDTO request) {

        log.info("Previewing salary certificate for employee: {}", request.getEmployeeName());

        ByteArrayInputStream pdfStream = salaryCertificateService.generateSalaryCertificatePdf(request);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"Salary_Certificate_Preview.pdf\"");
        headers.add(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdfStream));
    }

    @PostMapping("/convert-to-words")
    public ResponseEntity<Map<String, String>> convertToWords(@RequestBody Map<String, BigDecimal> payload) {
        BigDecimal amount = payload.get("amount");
        String words = salaryCertificateService.getSalaryInWords(amount);
        return ResponseEntity.ok(Map.of("words", words));
    }
}
