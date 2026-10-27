package com.Chinmay.Hotel.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SYNC_LOGS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "shopId")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)

public class SyncLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LOG_ID")
    @EqualsAndHashCode.Include
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SHOP_ID", nullable = false)
    private Shops shopId;

    @Column(name = "ENTITY_TYPE", nullable = false, length = 50)
    private String entityType;
    //Examples: ORDER, MENU , PAYMENT

    @Column(name = "ENTITY_ID", nullable = false)
    private Long entityId;

    @Column(name = "ACTION", nullable = false, length = 20)
    private String action;
    //Example: CREATE, UPDATE, DELETE

    @Column(name = "SOURCE_DEVICE_ID")
    private String sourceDeviceId;

    @Column(name = "SYNC_TIMESTAMP", insertable = false, updatable = false)
    private LocalDateTime syncTimestamp;



}
