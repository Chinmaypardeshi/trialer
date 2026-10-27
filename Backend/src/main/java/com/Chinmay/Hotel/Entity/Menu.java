package com.Chinmay.Hotel.Entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "MENU")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"shopId", "orderItems"})

public class Menu {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "MENU_ID")
    private Integer menuId;

    //Shop forign key where there can be many orders but one shop:- many to one 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SHOP_ID", nullable = false)
    private Shops shopId;

    //Group_id foreign key
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "GROUP_ID", nullable = false)
    private MenuGroup menuGroup;

    @Column(name = "ITEM_NAME", nullable = false)
    private String itemName;

    @Column(name = "PRICE", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "UPDATED_AT", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @Column(name = "IS_ACTIVE", nullable = false)
    private Boolean isActive = true;

    //Linked order items
    @OneToMany(mappedBy = "menuItem", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<OrderItems> orderItems;

    

}
