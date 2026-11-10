package com.Chinmay.Hotel.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

//Move items from one group to another
@Data
@AllArgsConstructor
public class MoveMenuItemRequestDTO {
    private Integer targetGroupId;
}
