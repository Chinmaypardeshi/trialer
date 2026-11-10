package com.Chinmay.Hotel.shop.service;

import java.util.List;
import com.Chinmay.Hotel.shop.dto.ShopRequestDTO;
import com.Chinmay.Hotel.shop.dto.ShopResponseDTO;

public interface AdminShopService {

    List<ShopResponseDTO> getAllShops();

    ShopResponseDTO getShopById(Integer shopId);

    ShopResponseDTO createShop(ShopRequestDTO dto, String adminUsername);

    ShopResponseDTO updateShop(Integer shopId, ShopRequestDTO dto, String adminUsername);

    ShopResponseDTO toggleShopStatus(Integer shopId, boolean isActive, String adminPassword, String adminUsername);

    void deleteShop(Integer shopId, String adminPassword, String adminUsername);

    boolean verifyAdminPassword(String adminUsername, String rawPassword);
}
