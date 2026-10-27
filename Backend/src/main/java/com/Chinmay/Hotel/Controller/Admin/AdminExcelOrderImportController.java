package com.Chinmay.Hotel.Controller.Admin;

import com.Chinmay.Hotel.DTO.Admin.AdminExcelValidationResultDTO;
import com.Chinmay.Hotel.Service.Admin.Impl.AdminExcelOrderImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/admin/excel-orders")
public class AdminExcelOrderImportController {

    private final AdminExcelOrderImportService
            adminExcelOrderImportService;

    public AdminExcelOrderImportController(
            AdminExcelOrderImportService adminExcelOrderImportService
    ) {
        this.adminExcelOrderImportService =
                adminExcelOrderImportService;
    }

    /*
     * Validate only.
     *
     * Nothing is inserted into the database.
     */
    @PostMapping("/validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminExcelValidationResultDTO> validateExcel(
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        AdminExcelValidationResultDTO result =
                adminExcelOrderImportService.validateExcel(file);

        return ResponseEntity.ok(result);
    }

    /*
     * Validate + import.
     */
    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminExcelValidationResultDTO> importExcel(
           @RequestParam("file") MultipartFile file,
           Authentication authentication
    ) throws Exception {

        AdminExcelValidationResultDTO result =
            adminExcelOrderImportService.importExcel(
                    file,
                    authentication.getName()
            );

        return ResponseEntity.ok(result);
    }
}