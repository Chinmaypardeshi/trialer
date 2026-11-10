package com.Chinmay.Hotel.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopGroupDTO {

    private Integer groupId;
    private String groupName;
    private Long totalQuantity;
    private Integer shopId;
    private String shopName;

    // 3-arg constructor for backwards compatibility
    public TopGroupDTO(Integer groupId, String groupName, Long totalQuantity) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.totalQuantity = totalQuantity;
        this.shopId = null;
        this.shopName = null;
    }
}
