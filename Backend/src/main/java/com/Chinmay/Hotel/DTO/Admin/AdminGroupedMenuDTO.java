package com.Chinmay.Hotel.DTO.Admin;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
//Group Dto(contains list of items)
public class AdminGroupedMenuDTO {
    private Integer groupId;
    private String groupName;
    private List<AdminGroupedMenuItemDTO> items;
}
