package com.Chinmay.Hotel.DTO.Admin;

import lombok.AllArgsConstructor;
import lombok.Data;

//Connected with menuGroupRepository
@Data
@AllArgsConstructor
public class AdminMenuGroupResponseDTO {
    private Integer groupId;
    private String groupName;
}
