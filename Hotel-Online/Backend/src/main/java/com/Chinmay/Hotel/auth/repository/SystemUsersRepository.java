package com.Chinmay.Hotel.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Chinmay.Hotel.auth.entity.SystemUsers;

import java.util.Optional;

public interface SystemUsersRepository extends JpaRepository<SystemUsers, Integer> {

    Optional<SystemUsers> findByUsername(String username);

    long countByShopId_ShopId(Integer shopId);
}
