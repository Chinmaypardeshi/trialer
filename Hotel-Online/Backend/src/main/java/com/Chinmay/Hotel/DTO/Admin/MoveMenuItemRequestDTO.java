package com.Chinmay.Hotel.DTO.Admin;

import lombok.AllArgsConstructor;
import lombok.Data;

//Move items from one group to another
@Data
@AllArgsConstructor
public class MoveMenuItemRequestDTO {
    private Integer targetGroupId;
}
