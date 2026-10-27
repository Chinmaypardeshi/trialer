package com.Chinmay.Hotel.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Chinmay.Hotel.Entity.Menu;
import com.Chinmay.Hotel.Entity.MenuGroup;
import com.Chinmay.Hotel.Entity.Shops;

public interface MenuRepository extends JpaRepository<Menu,Integer> {

    //Both methods are for admin menu items updation and creation feature related
    List<Menu> findByShopId_ShopIdOrderByItemNameAsc(Integer shopid);

    List<Menu> findByShopId_ShopIdAndIsActiveTrue(Integer shopId);


    @Query("""
    SELECT m FROM Menu m
    JOIN FETCH m.menuGroup
    WHERE m.shopId.shopId = :shopId
    ORDER BY m.menuGroup.groupName, m.itemName
    """)
    List<Menu> findAllMenusWithGroup(@Param("shopId") Integer shopId);


    List<Menu> findByShopId_ShopIdOrderByMenuGroup_GroupNameAscItemNameAsc(Integer shopId);

    List<Menu> findByMenuGroup(MenuGroup group);

    boolean existsByItemNameAndShopIdAndMenuGroup_GroupId(   
        String itemName, 
        Shops shopId,
        Integer groupId
    );

    



}

