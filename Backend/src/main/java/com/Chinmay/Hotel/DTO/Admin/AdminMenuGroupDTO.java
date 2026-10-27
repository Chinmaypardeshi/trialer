package com.Chinmay.Hotel.DTO.Admin;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;


//this dto is created to solve the error of groupid where even after entering groupid one it returns all menu items fro mall groups instead of that specific group
//general based dto
@Data
@AllArgsConstructor
public class AdminMenuGroupDTO {
    private Integer groupId;
    private String groupName;
    private List<AdminMenuResponseDTO> items = new ArrayList<>();
    
}
