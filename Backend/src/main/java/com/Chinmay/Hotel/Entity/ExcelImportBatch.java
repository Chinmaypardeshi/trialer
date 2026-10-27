package com.Chinmay.Hotel.Entity;

import com.Chinmay.Hotel.Entity.SystemUsers;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "EXCEL_IMPORT_BATCH")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExcelImportBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IMPORT_ID")
    private Long importId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private SystemUsers importedBy;

    @Column(name = "FILE_HASH", unique = true, length = 64)
    private String fileHash;

    @Column(name = "FILE_NAME", nullable = false)
    private String fileName;

    @Column(name = "TOTAL_ROWS", nullable = false)
    private Integer totalRows;

    @Column(name = "TOTAL_ORDERS", nullable = false)
    private Integer totalOrders;

    @Column(name = "TOTAL_ITEMS", nullable = false)
    private Integer totalItems;

    @Column(name = "STATUS", nullable = false)
    private String status;

    @Column(name = "IMPORTED_AT", nullable = false)
    private LocalDateTime importedAt;
}