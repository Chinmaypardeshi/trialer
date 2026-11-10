package com.Chinmay.Hotel.order.excel.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Chinmay.Hotel.order.excel.entity.ExcelImportBatch;

public interface ExcelImportBatchRepository
        extends JpaRepository<ExcelImportBatch, Long> {
        
        boolean existsByFileHash(String fileHash);                
}