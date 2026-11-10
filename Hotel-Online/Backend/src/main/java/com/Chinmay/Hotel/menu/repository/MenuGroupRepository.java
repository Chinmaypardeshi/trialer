package com.Chinmay.Hotel.menu.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Chinmay.Hotel.common.entity.Shops;
import com.Chinmay.Hotel.menu.entity.MenuGroup;

public interface MenuGroupRepository extends JpaRepository<MenuGroup, Integer> {
    List<MenuGroup> findByShopId_ShopIdOrderByGroupNameAsc(Integer shopId);
    
    boolean existsByShopId_ShopIdAndGroupNameIgnoreCase(Integer shopId, String groupName);

    Optional<MenuGroup> findByGroupNameAndShopId(
        String name, 
        Shops shop
    );

    Optional<MenuGroup> findByGroupNameIgnoreCaseAndShopId(
        String name, 
        Shops shop
    );

    long countByShopId_ShopId(Integer shopId);

    void deleteByShopId(Shops shopId);
}
