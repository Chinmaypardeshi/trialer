package com.Chinmay.Hotel.salary.service;

import com.Chinmay.Hotel.salary.dto.SalaryCertificateRequestDTO;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;

public interface AdminSalaryCertificateService {

    ByteArrayInputStream generateSalaryCertificatePdf(SalaryCertificateRequestDTO request);

    String getSalaryInWords(BigDecimal amount);
}
