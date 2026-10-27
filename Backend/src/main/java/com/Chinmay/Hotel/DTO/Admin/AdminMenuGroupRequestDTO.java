package com.Chinmay.Hotel.DTO.Admin;

import lombok.AllArgsConstructor;
import lombok.Data;

//Connected with menuGroupRepository
@Data
@AllArgsConstructor
public class AdminMenuGroupRequestDTO {
    private String groupName;
}
