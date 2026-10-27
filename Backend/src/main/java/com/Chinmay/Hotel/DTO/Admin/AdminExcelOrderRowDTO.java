package com.Chinmay.Hotel.DTO.Admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminExcelOrderRowDTO {

    private String systemUsername;

    private String shopName;

    private String orderRef;

    private LocalDateTime orderDate;

    private String status;

    private String payment;

    private String menuGroupName;

    private String menuItemName;

    private Integer quantity;

    private BigDecimal price;
    
}
