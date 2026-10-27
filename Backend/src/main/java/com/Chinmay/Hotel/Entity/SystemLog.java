package com.Chinmay.Hotel.Entity;
import java.time.LocalDateTime;

import com.Chinmay.Hotel.Enums.ServerEventType;

import jakarta.persistence.*;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Table(name = "SYSTEM_LOGS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)

public class SystemLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "LOG_ID")
    private Long logId;

    @Column(name = "SHOP_ID")
    private Integer shopId;

    @Column(name = "USER_ID")
    private Integer userId;

    @Column(name = "SOURCE_DEVICE_ID")
    private String sourceDeviceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "EVENT_TYPE")
    private ServerEventType eventType;

    @Column(name = "MESSAGE", nullable = false)
    private String messageString;

    @Column(name = "EVENT_TIME" )
    private LocalDateTime eventTime;
}
