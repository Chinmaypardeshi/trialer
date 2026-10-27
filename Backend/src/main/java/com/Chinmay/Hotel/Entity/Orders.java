package com.Chinmay.Hotel.Entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.Chinmay.Hotel.Enums.OrderStatus;
import com.Chinmay.Hotel.Enums.PaymentMode;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ORDERS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"user", "orderItems", "shop"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)

public class Orders {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ORDER_ID")
    @EqualsAndHashCode.Include 
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    @JsonIgnore
    private SystemUsers user;

    @Column(name = "DEVICE_ORDER_UUID", nullable = false, unique = true, length = 100)
    private String deviceOrderUuid;

    @Column(name = "ORDER_TIME", nullable = false)
    private LocalDateTime orderTime;

    @Column(name = "PAYMENT_TIME")
    private LocalDateTime paymentTime;

    @Column(name = "TOTAL_AMOUNT", nullable = false, precision = 10, scale = 2 )
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "MODE_OF_PAYMENT")
    private PaymentMode modeOfPayment;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false)
    private OrderStatus status;

    @Column(name = "SOURCE_DEVICE_ID")
    private String sourceDeviceId;

    @Column(name = "SYNC_TIME", insertable = false, updatable = false)
    private LocalDateTime syncTime;

    // Note: Holds the full Shops entity mapped to SHOP_ID; named 'shop' here, whereas other entities use 'shopId'.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SHOP_ID", nullable = false)
    @JsonIgnore 
    private Shops shop;

    @OneToMany(
        mappedBy = "order", 
        cascade = CascadeType.ALL
    )
    @JsonIgnore
    private List<OrderItems> orderItems = new ArrayList<>();

    @PrePersist
    public void prePersist() {
    if (this.orderTime == null){
        this.orderTime = LocalDateTime.now();
    }
    if (this.status == null){
        this.status = OrderStatus.ACTIVE;
    }
}

}
