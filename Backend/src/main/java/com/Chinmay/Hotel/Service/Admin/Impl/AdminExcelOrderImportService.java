package com.Chinmay.Hotel.Service.Admin.Impl;

import com.Chinmay.Hotel.DTO.Admin.AdminExcelOrderRowDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminExcelValidationResultDTO;
import com.Chinmay.Hotel.Entity.Menu;
import com.Chinmay.Hotel.Entity.MenuGroup;
import com.Chinmay.Hotel.Entity.OrderItems;
import com.Chinmay.Hotel.Entity.Orders;
import com.Chinmay.Hotel.Entity.Shops;
import com.Chinmay.Hotel.Entity.SystemUsers;
import com.Chinmay.Hotel.Entity.ExcelImportBatch;
import com.Chinmay.Hotel.Enums.OrderStatus;
import com.Chinmay.Hotel.Enums.PaymentMode;
import com.Chinmay.Hotel.Repository.MenuGroupRepository;
import com.Chinmay.Hotel.Repository.MenuRepository;
import com.Chinmay.Hotel.Repository.OrdersRepository;
import com.Chinmay.Hotel.Repository.ShopsRepository;
import com.Chinmay.Hotel.Repository.SystemUsersRepository;
import com.Chinmay.Hotel.Repository.ExcelImportBatchRepository;
import com.Chinmay.Hotel.Service.Admin.AdminExcelOrderReader;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminExcelOrderImportService {

    private final AdminExcelOrderReader excelOrderReader;
    private final AdminExcelOrderValidator excelOrderValidator;
    private final ExcelImportBatchRepository excelImportBatchRepository;

    private final SystemUsersRepository systemUsersRepository;
    private final ShopsRepository shopsRepository;
    private final MenuGroupRepository menuGroupRepository;
    private final MenuRepository menuRepository;
    private final OrdersRepository ordersRepository;

    public AdminExcelOrderImportService(
            AdminExcelOrderReader excelOrderReader,
            AdminExcelOrderValidator excelOrderValidator,
            SystemUsersRepository systemUsersRepository,
            ShopsRepository shopsRepository,
            MenuGroupRepository menuGroupRepository,
            MenuRepository menuRepository,
            OrdersRepository ordersRepository,
            ExcelImportBatchRepository excelImportBatchRepository
    ) {
        this.excelOrderReader = excelOrderReader;
        this.excelOrderValidator = excelOrderValidator;
        this.systemUsersRepository = systemUsersRepository;
        this.shopsRepository = shopsRepository;
        this.menuGroupRepository = menuGroupRepository;
        this.menuRepository = menuRepository;
        this.ordersRepository = ordersRepository;
        this.excelImportBatchRepository = excelImportBatchRepository;
    }

    /*
     * STEP 1:
     * Validate Excel without inserting anything.
     */
    public AdminExcelValidationResultDTO validateExcel(
            MultipartFile file
    ) throws Exception {

        List<AdminExcelOrderRowDTO> rows =
                excelOrderReader.readExcel(file);

        return excelOrderValidator.validate(rows);
    }

    /*
     * STEP 2:
     * Validate the complete Excel file, check for duplicate
     * file content, and import only when valid.
     *
     * @Transactional rolls back database changes if an
     * exception occurs during the transaction.
     */
    @Transactional
    public AdminExcelValidationResultDTO importExcel(
            MultipartFile file,
            String username
    ) throws Exception {

        // 1. Read the Excel file.
        List<AdminExcelOrderRowDTO> rows =
                excelOrderReader.readExcel(file);

        // 2. Validate the complete file before inserting.
        AdminExcelValidationResultDTO validationResult =
                excelOrderValidator.validate(rows);

        // 3. Stop if validation fails.
        if (!validationResult.isValid()) {
            return validationResult;
        }

        // 4. Calculate the SHA-256 hash of the file contents.
        String fileHash = calculateSha256(file.getBytes());

        // 5. Reject a file whose hash already exists.
        if (excelImportBatchRepository.existsByFileHash(fileHash)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This Excel file has already been imported."
            );
        }

        // 6. Find the authenticated admin.
        SystemUsers importedBy =
                systemUsersRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Authenticated admin not found"
                                )
                        );

        // 7. Group item rows by Excel Order Ref.
        Map<String, List<AdminExcelOrderRowDTO>> ordersByRef =
                rows.stream()
                        .collect(
                                Collectors.groupingBy(
                                        row -> row.getOrderRef().trim()
                                )
                        );

        // 8. Create one Orders record for each Order Ref.
        for (Map.Entry<String, List<AdminExcelOrderRowDTO>> entry
                : ordersByRef.entrySet()) {

            List<AdminExcelOrderRowDTO> orderRows =
                    entry.getValue();

            // Order-level fields are consistent after validation.
            AdminExcelOrderRowDTO firstRow = orderRows.get(0);

            // Find the system user associated with the order.
            SystemUsers user =
                    systemUsersRepository
                            .findByUsername(firstRow.getSystemUsername())
                            .orElseThrow(() ->
                                    new IllegalStateException(
                                            "System User not found during import: "
                                                    + firstRow.getSystemUsername()
                                    )
                            );

            // Find the shop.
            Shops shop =
                    shopsRepository
                            .findByShopName(firstRow.getShopName())
                            .orElseThrow(() ->
                                    new IllegalStateException(
                                            "Shop not found during import: "
                                                    + firstRow.getShopName()
                                    )
                            );

            // Create the order.
            Orders order = new Orders();

            order.setOrderItems(new ArrayList<>());
            order.setUser(user);
            order.setShop(shop);

            // Internal UUID is separate from the Excel Order Ref.
            order.setDeviceOrderUuid(UUID.randomUUID().toString());

            order.setOrderTime(firstRow.getOrderDate());

            // Convert the Excel status to its enum.
            OrderStatus orderStatus =
                    OrderStatus.valueOf(
                            firstRow.getStatus()
                                    .trim()
                                    .toUpperCase()
                    );

            order.setStatus(orderStatus);

            // Convert the Excel payment mode to its enum.
            PaymentMode paymentMode =
                    PaymentMode.valueOf(
                            firstRow.getPayment()
                                    .trim()
                                    .toUpperCase()
                    );

            order.setModeOfPayment(paymentMode);

            // Historical paid orders use the order date as payment time.
            if (orderStatus == OrderStatus.PAID) {
                order.setPaymentTime(firstRow.getOrderDate());
            } else {
                order.setPaymentTime(null);
            }

            // Mark the order as imported from Excel.
            order.setSourceDeviceId("EXCEL_IMPORT");
            order.setSyncTime(LocalDateTime.now());

            BigDecimal totalAmount = BigDecimal.ZERO;

            // Create the order items.
            for (AdminExcelOrderRowDTO row : orderRows) {

                // Find the menu group for this shop.
                MenuGroup menuGroup =
                        menuGroupRepository
                                .findByGroupNameAndShopId(
                                        row.getMenuGroupName(),
                                        shop
                                )
                                .orElseThrow(() ->
                                        new IllegalStateException(
                                                "Menu Group not found during import: "
                                                        + row.getMenuGroupName()
                                        )
                                );

                // Find the menu item in that group.
                Menu menu =
                        menuRepository
                                .findByMenuGroup(menuGroup)
                                .stream()
                                .filter(m ->
                                        m.getItemName().equalsIgnoreCase(
                                                row.getMenuItemName()
                                        )
                                )
                                .findFirst()
                                .orElseThrow(() ->
                                        new IllegalStateException(
                                                "Menu Item not found during import: "
                                                        + row.getMenuItemName()
                                        )
                                );

                OrderItems orderItem = new OrderItems();

                orderItem.setOrder(order);
                orderItem.setMenuItem(menu);
                orderItem.setQuantity(row.getQuantity());

                // Preserve the historical price from Excel.
                orderItem.setPriceAtPurchase(row.getPrice());

                order.getOrderItems().add(orderItem);

                // Calculate quantity multiplied by historical price.
                BigDecimal itemTotal =
                        row.getPrice().multiply(
                                BigDecimal.valueOf(row.getQuantity())
                        );

                totalAmount = totalAmount.add(itemTotal);
            }

            order.setTotalAmount(totalAmount);

            // Saving the order also saves its items through cascade.
            ordersRepository.save(order);
        }

        // 9. Record one import batch for the complete file.
        ExcelImportBatch batch = new ExcelImportBatch();

        batch.setImportedBy(importedBy);
        batch.setFileName(file.getOriginalFilename());
        batch.setFileHash(fileHash);
        batch.setTotalRows(rows.size());
        batch.setTotalOrders(ordersByRef.size());
        batch.setTotalItems(rows.size());
        batch.setStatus("SUCCESS");
        batch.setImportedAt(LocalDateTime.now());

        excelImportBatchRepository.save(batch);

        return validationResult;
    }

    /*
     * Calculate a 64-character hexadecimal SHA-256 hash.
     */
    private String calculateSha256(byte[] content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(content);

            return HexFormat.of().formatHex(hashBytes);

        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(
                    "SHA-256 algorithm is unavailable",
                    e
            );
        }
    }
}
