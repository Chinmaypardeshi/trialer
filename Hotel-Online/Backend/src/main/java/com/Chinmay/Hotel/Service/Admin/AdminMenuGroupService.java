package com.Chinmay.Hotel.Service.Admin;

import java.util.List;

import com.Chinmay.Hotel.DTO.Admin.AdminMenuGroupRequestDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminMenuGroupResponseDTO;

//Connected with menuGroupReposiotry, menugroupresponse/requestdto
public interface AdminMenuGroupService {
    
    //get all groups
    List<AdminMenuGroupResponseDTO> getAllGroups(Integer shopId);
    
    //create group
    AdminMenuGroupResponseDTO createGroup(Integer shopId, AdminMenuGroupRequestDTO dto);

    //rename a existing group
    AdminMenuGroupResponseDTO renameGroup(Integer groupid, AdminMenuGroupRequestDTO dto);

    //hard delete a group
    void deleteGroup(Integer groupId);
}
