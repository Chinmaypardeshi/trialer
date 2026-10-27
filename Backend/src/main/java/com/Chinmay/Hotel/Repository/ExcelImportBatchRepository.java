package com.Chinmay.Hotel.Repository;

import com.Chinmay.Hotel.Entity.ExcelImportBatch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExcelImportBatchRepository
        extends JpaRepository<ExcelImportBatch, Long> {
        
        boolean existsByFileHash(String fileHash);                
}