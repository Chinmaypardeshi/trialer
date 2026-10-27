package com.Chinmay.Hotel.DTO.Admin;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopGroupDTO {

    private Integer groupId;
    private String groupName;
    private Long totalQuantity;
    
}
