package com.Chinmay.Hotel.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Chinmay.Hotel.Entity.Menu;
import com.Chinmay.Hotel.Entity.MenuGroup;
import com.Chinmay.Hotel.Entity.Shops;

public interface MenuGroupRepository extends JpaRepository<MenuGroup, Integer> {
    //Prevent duplicate group names per shop
    List <MenuGroup> findByShopId_ShopIdOrderByGroupNameAsc(Integer shopId);
    
    boolean existsByShopId_ShopIdAndGroupNameIgnoreCase(Integer shopId, String groupName);

    Optional<MenuGroup> findByGroupNameAndShopId(
        String name, 
        Shops shop
    );

    


}