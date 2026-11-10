package com.Chinmay.Hotel.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

//Connected with menuGroupRepository
@Data
@AllArgsConstructor
public class AdminMenuGroupRequestDTO {
    private String groupName;
}
