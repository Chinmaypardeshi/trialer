package com.Chinmay.Hotel.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import com.Chinmay.Hotel.Entity.Shops;

public interface ShopsRepository extends JpaRepository<Shops, Integer> {
    Optional<Shops> findByShopName(String shopName);
}
