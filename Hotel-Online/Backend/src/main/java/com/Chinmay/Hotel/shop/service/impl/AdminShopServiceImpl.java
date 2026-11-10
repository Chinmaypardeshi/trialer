package com.Chinmay.Hotel.shop.service.impl;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.Chinmay.Hotel.auth.entity.SystemUsers;
import com.Chinmay.Hotel.auth.repository.SystemUsersRepository;
import com.Chinmay.Hotel.common.entity.Shops;
import com.Chinmay.Hotel.common.repository.ShopsRepository;
import com.Chinmay.Hotel.menu.entity.MenuGroup;
import com.Chinmay.Hotel.menu.repository.MenuGroupRepository;
import com.Chinmay.Hotel.menu.repository.MenuRepository;
import com.Chinmay.Hotel.order.repository.OrdersRepository;
import com.Chinmay.Hotel.shop.dto.ShopRequestDTO;
import com.Chinmay.Hotel.shop.dto.ShopResponseDTO;
import com.Chinmay.Hotel.shop.service.AdminShopService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminShopServiceImpl implements AdminShopService {

    private final ShopsRepository shopsRepository;
    private final SystemUsersRepository systemUsersRepository;
    private final MenuRepository menuRepository;
    private final MenuGroupRepository menuGroupRepository;
    private final OrdersRepository ordersRepository;
    private final PasswordEncoder passwordEncoder;

    private void validateAdminPassword(String adminUsername, String rawPassword) {
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin password is required to perform this action.");
        }

        SystemUsers adminUser = systemUsersRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin user account not found."));

        boolean matches = passwordEncoder.matches(rawPassword, adminUser.getPasswordHash())
                || rawPassword.equals(adminUser.getPasswordHash());

        if (!matches) {
            log.warn("Unauthorized attempt to modify shop by admin user: {}", adminUsername);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin password. Action rejected.");
        }
    }

    private ShopResponseDTO toDTO(Shops shop) {
        long totalDishes = menuRepository.countByShopId_ShopId(shop.getShopId());
        long totalGroups = menuGroupRepository.countByShopId_ShopId(shop.getShopId());
        long totalOrders = ordersRepository.countByShop_ShopId(shop.getShopId());

        return new ShopResponseDTO(
                shop.getShopId(),
                shop.getShopName(),
                shop.getLocation(),
                shop.getCreatedAt(),
                shop.getIsActive() != null ? shop.getIsActive() : true,
                totalDishes,
                totalGroups,
                totalOrders
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShopResponseDTO> getAllShops() {
        return shopsRepository.findAll().stream()
                .sorted(Comparator.comparing(Shops::getShopId))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ShopResponseDTO getShopById(Integer shopId) {
        Shops shop = shopsRepository.findById(shopId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Branch with ID " + shopId + " not found."));
        return toDTO(shop);
    }

    @Override
    @Transactional
    public ShopResponseDTO createShop(ShopRequestDTO dto, String adminUsername) {
        validateAdminPassword(adminUsername, dto.getAdminPassword());

        if (dto.getShopName() == null || dto.getShopName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Branch name cannot be empty.");
        }

        String trimmedName = dto.getShopName().trim();
        if (shopsRepository.existsByShopNameIgnoreCase(trimmedName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A branch with the name '" + trimmedName + "' already exists.");
        }

        Shops shop = new Shops();
        shop.setShopName(trimmedName);
        shop.setLocation(dto.getLocation() != null ? dto.getLocation().trim() : "");
        shop.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        Shops savedShop = shopsRepository.save(shop);

        // Auto-create quarantine TRASH group for this newly created branch
        MenuGroup trashGroup = new MenuGroup();
        trashGroup.setGroupName("TRASH");
        trashGroup.setShopId(savedShop);
        menuGroupRepository.save(trashGroup);

        log.info("Admin '{}' created branch '{}' (ID: {}) with default TRASH group", adminUsername, savedShop.getShopName(), savedShop.getShopId());
        return toDTO(savedShop);
    }

    @Override
    @Transactional
    public ShopResponseDTO updateShop(Integer shopId, ShopRequestDTO dto, String adminUsername) {
        validateAdminPassword(adminUsername, dto.getAdminPassword());

        Shops shop = shopsRepository.findById(shopId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Branch with ID " + shopId + " not found."));

        if (dto.getShopName() == null || dto.getShopName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Branch name cannot be empty.");
        }

        String trimmedName = dto.getShopName().trim();
        if (shopsRepository.existsByShopNameIgnoreCaseAndShopIdNot(trimmedName, shopId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Another branch with the name '" + trimmedName + "' already exists.");
        }

        shop.setShopName(trimmedName);
        if (dto.getLocation() != null) {
            shop.setLocation(dto.getLocation().trim());
        }
        if (dto.getIsActive() != null) {
            shop.setIsActive(dto.getIsActive());
        }

        Shops updated = shopsRepository.save(shop);
        log.info("Admin '{}' updated branch ID: {} ('{}', isActive: {})", adminUsername, shopId, updated.getShopName(), updated.getIsActive());
        return toDTO(updated);
    }

    @Override
    @Transactional
    public ShopResponseDTO toggleShopStatus(Integer shopId, boolean isActive, String adminPassword, String adminUsername) {
        validateAdminPassword(adminUsername, adminPassword);

        Shops shop = shopsRepository.findById(shopId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Branch with ID " + shopId + " not found."));

        shop.setIsActive(isActive);
        Shops updated = shopsRepository.save(shop);
        log.info("Admin '{}' set branch ID: {} status to isActive={}", adminUsername, shopId, isActive);
        return toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteShop(Integer shopId, String adminPassword, String adminUsername) {
        validateAdminPassword(adminUsername, adminPassword);

        Shops shop = shopsRepository.findById(shopId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Branch with ID " + shopId + " not found."));

        long orderCount = ordersRepository.countByShop_ShopId(shopId);
        long staffCount = systemUsersRepository.countByShopId_ShopId(shopId);

        // OPTION 1 (Soft Delete): If historical orders or staff exist, deactivate the branch safely
        if (orderCount > 0 || staffCount > 0) {
            shop.setIsActive(false);
            shopsRepository.save(shop);
            log.info("Branch '{}' (ID: {}) has {} orders and {} staff. Safely deactivated (soft-deleted).",
                    shop.getShopName(), shopId, orderCount, staffCount);
            return;
        }

        // Truly empty branch with 0 orders and 0 staff -> safe hard delete
        menuRepository.deleteByShopId(shop);
        menuGroupRepository.deleteByShopId(shop);
        shopsRepository.delete(shop);

        log.info("Admin '{}' permanently deleted branch ID: {} ('{}')", adminUsername, shopId, shop.getShopName());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean verifyAdminPassword(String adminUsername, String rawPassword) {
        try {
            validateAdminPassword(adminUsername, rawPassword);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
