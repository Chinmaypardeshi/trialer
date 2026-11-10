package com.Chinmay.Hotel.salary.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryCertificateRequestDTO {

    @NotBlank(message = "Employee name is required")
    private String employeeName;

    @NotBlank(message = "Joining date or year is required")
    private String joiningDateOrYear;

    @NotNull(message = "Monthly gross salary is required")
    @Positive(message = "Monthly gross salary must be greater than zero")
    private BigDecimal monthlyGrossSalary;

    @NotNull(message = "Issue date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate issueDate;

    @Builder.Default
    private String purpose = "official purposes";

    private String designation;

    @Builder.Default
    private List<SalaryComponentDTO> components = new ArrayList<>();
}
