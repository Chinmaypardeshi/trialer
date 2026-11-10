package com.Chinmay.Hotel.common.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.Chinmay.Hotel.common.entity.Shops;

public interface ShopsRepository extends JpaRepository<Shops, Integer> {
    Optional<Shops> findByShopName(String shopName);
    Optional<Shops> findByShopNameIgnoreCase(String shopName);
    boolean existsByShopNameIgnoreCase(String shopName);
    boolean existsByShopNameIgnoreCaseAndShopIdNot(String shopName, Integer shopId);
}
