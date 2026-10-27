package com.Chinmay.Hotel.Service.Admin.Impl;

import com.Chinmay.Hotel.DTO.Admin.AdminExcelImportErrorDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminExcelOrderRowDTO;
import com.Chinmay.Hotel.DTO.Admin.AdminExcelValidationResultDTO;
import com.Chinmay.Hotel.Entity.MenuGroup;
import com.Chinmay.Hotel.Entity.Shops;
import com.Chinmay.Hotel.Entity.SystemUsers;
import com.Chinmay.Hotel.Repository.MenuGroupRepository;
import com.Chinmay.Hotel.Repository.MenuRepository;
import com.Chinmay.Hotel.Repository.ShopsRepository;
import com.Chinmay.Hotel.Repository.SystemUsersRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AdminExcelOrderValidator {

    private final SystemUsersRepository systemUsersRepository;
    private final ShopsRepository shopsRepository;
    private final MenuGroupRepository menuGroupRepository;
    private final MenuRepository menuRepository;

    public AdminExcelOrderValidator(
            SystemUsersRepository systemUsersRepository,
            ShopsRepository shopsRepository,
            MenuGroupRepository menuGroupRepository,
            MenuRepository menuRepository
    ) {
        this.systemUsersRepository = systemUsersRepository;
        this.shopsRepository = shopsRepository;
        this.menuGroupRepository = menuGroupRepository;
        this.menuRepository = menuRepository;
    }

    public AdminExcelValidationResultDTO validate(
            List<AdminExcelOrderRowDTO> rows
    ) {

        List<AdminExcelImportErrorDTO> errors = new ArrayList<>();

        int validRows = 0;

        /*
         * Stores the first row of every Order Ref.
         *
         * We use this to make sure that all rows belonging
         * to the same order have the same order-level data.
         */
        Map<String, AdminExcelOrderRowDTO> firstRowByOrderRef =
                new HashMap<>();

        for (int i = 0; i < rows.size(); i++) {

            AdminExcelOrderRowDTO row = rows.get(i);

            // Excel header is row 1, so actual Excel row is i + 2
            int excelRowNumber = i + 2;

            boolean rowValid = true;

            /*
             * Basic field validation
             */

            if (isBlank(row.getSystemUsername())) {
                addError(
                        errors,
                        excelRowNumber,
                        row.getOrderRef(),
                        "System User",
                        row.getSystemUsername(),
                        "System User is required."
                );
                rowValid = false;
            }

            if (isBlank(row.getShopName())) {
                addError(
                        errors,
                        excelRowNumber,
                        row.getOrderRef(),
                        "Shop",
                        row.getShopName(),
                        "Shop is required."
                );
                rowValid = false;
            }

            if (isBlank(row.getOrderRef())) {
                addError(
                        errors,
                        excelRowNumber,
                        null,
                        "Order Ref",
                        row.getOrderRef(),
                        "Order Ref is required."
                );
                rowValid = false;
            }

            if (row.getOrderDate() == null) {
                addError(
                        errors,
                        excelRowNumber,
                        row.getOrderRef(),
                        "Order Date",
                        null,
                        "Order Date is required and must be a valid Excel date."
                );
                rowValid = false;
            }

            if (isBlank(row.getStatus())) {
                addError(
                        errors,
                        excelRowNumber,
                        row.getOrderRef(),
                        "Status",
                        row.getStatus(),
                        "Status is required."
                );
                rowValid = false;
            }

            if (isBlank(row.getPayment())) {
                addError(
                        errors,
                        excelRowNumber,
                        row.getOrderRef(),
                        "Payment",
                        row.getPayment(),
                        "Payment is required."
                );
                rowValid = false;
            }

            if (isBlank(row.getMenuGroupName())) {
                addError(
                        errors,
                        excelRowNumber,
                        row.getOrderRef(),
                        "Menu Group",
                        row.getMenuGroupName(),
                        "Menu Group is required."
                );
                rowValid = false;
            }

            if (isBlank(row.getMenuItemName())) {
                addError(
                        errors,
                        excelRowNumber,
                        row.getOrderRef(),
                        "Menu Item",
                        row.getMenuItemName(),
                        "Menu Item is required."
                );
                rowValid = false;
            }

            if (row.getQuantity() == null || row.getQuantity() <= 0) {
                addError(
                        errors,
                        excelRowNumber,
                        row.getOrderRef(),
                        "Qty",
                        String.valueOf(row.getQuantity()),
                        "Quantity must be greater than zero."
                );
                rowValid = false;
            }

            
                if (row.getPrice() == null) {
                addError(
                        errors,
                        excelRowNumber,
                        row.getOrderRef(),
                        "Price",
                        null,
                        "Price is required."
                );
                rowValid = false;

                } else if (row.getPrice().signum() < 0) {
                addError(
                        errors,
                        excelRowNumber,
                        row.getOrderRef(),
                        "Price",
                        String.valueOf(row.getPrice()),
                        "Price must be zero or greater."
                );
                rowValid = false;
                }


            /*
             * Enum validation
             */

            if (!isValidStatus(row.getStatus())) {

                addError(
                        errors,
                        excelRowNumber,
                        row.getOrderRef(),
                        "Status",
                        row.getStatus(),
                        "Invalid order status."
                );

                rowValid = false;
            }

            if (!isValidPayment(row.getPayment())) {

                addError(
                        errors,
                        excelRowNumber,
                        row.getOrderRef(),
                        "Payment",
                        row.getPayment(),
                        "Invalid payment mode."
                );

                rowValid = false;
            }

            /*
             * ORDER-LEVEL CONSISTENCY
             *
             * If the same Order Ref appears multiple times,
             * these fields must remain identical:
             *
             * System User
             * Shop
             * Order Date
             * Status
             * Payment
             */

            if (!isBlank(row.getOrderRef())) {

                String orderRef = row.getOrderRef().trim();

                AdminExcelOrderRowDTO firstRow =
                        firstRowByOrderRef.get(orderRef);

                if (firstRow == null) {

                    // First row belonging to this order
                    firstRowByOrderRef.put(orderRef, row);

                } else {

                    // Compare current row with first row
                    checkOrderConsistency(
                            errors,
                            excelRowNumber,
                            row,
                            firstRow
                    );

                    /*
                     * If consistency check found an error,
                     * this row should not be counted as valid.
                     */
                    if (!isOrderConsistent(row, firstRow)) {
                        rowValid = false;
                    }
                }
            }

            /*
             * Database validation
             *
             * Only continue if the basic values are present
             * and valid.
             */

            if (rowValid) {

                SystemUsers user =
                        systemUsersRepository
                                .findByUsername(row.getSystemUsername())
                                .orElse(null);

                if (user == null) {

                    addError(
                            errors,
                            excelRowNumber,
                            row.getOrderRef(),
                            "System User",
                            row.getSystemUsername(),
                            "System User does not exist."
                    );

                    rowValid = false;
                }

                Shops shop =
                        shopsRepository
                                .findByShopName(row.getShopName())
                                .orElse(null);

                if (shop == null) {

                    addError(
                            errors,
                            excelRowNumber,
                            row.getOrderRef(),
                            "Shop",
                            row.getShopName(),
                            "Shop does not exist."
                    );

                    rowValid = false;
                }

                /*
                 * User must belong to the selected shop.
                 */

                if (user != null && shop != null) {

                    if (!user.getShopId()
                            .getShopId()
                            .equals(shop.getShopId())) {

                        addError(
                                errors,
                                excelRowNumber,
                                row.getOrderRef(),
                                "System User",
                                row.getSystemUsername(),
                                "System User does not belong to the selected shop."
                        );

                        rowValid = false;
                    }
                }

                /*
                 * Validate Menu Group.
                 */

                MenuGroup menuGroup = null;

                if (shop != null) {

                    menuGroup =
                            menuGroupRepository
                                    .findByGroupNameAndShopId(
                                            row.getMenuGroupName(),
                                            shop
                                    )
                                    .orElse(null);

                    if (menuGroup == null) {

                        addError(
                                errors,
                                excelRowNumber,
                                row.getOrderRef(),
                                "Menu Group",
                                row.getMenuGroupName(),
                                "Menu Group does not exist for the selected shop."
                        );

                        rowValid = false;
                    }
                }

                /*
                 * Validate Menu Item.
                 */

                if (shop != null && menuGroup != null) {

                    boolean menuExists =
                            menuRepository
                                    .existsByItemNameAndShopIdAndMenuGroup_GroupId(
                                            row.getMenuItemName(),
                                            shop,
                                            menuGroup.getGroupId()
                                    );

                    if (!menuExists) {

                        addError(
                                errors,
                                excelRowNumber,
                                row.getOrderRef(),
                                "Menu Item",
                                row.getMenuItemName(),
                                "Menu Item does not exist for the selected shop and menu group."
                        );

                        rowValid = false;
                    }
                }
            }

            if (rowValid) {
                validRows++;
            }
        }

        return new AdminExcelValidationResultDTO(
                errors.isEmpty(),
                rows.size(),
                validRows,
                errors
        );
    }

    /*
     * Check whether order-level fields are identical.
     */
    private boolean isOrderConsistent(
            AdminExcelOrderRowDTO currentRow,
            AdminExcelOrderRowDTO firstRow
    ) {

        return equalsValue(
                currentRow.getSystemUsername(),
                firstRow.getSystemUsername()
        )
                && equalsValue(
                currentRow.getShopName(),
                firstRow.getShopName()
        )
                && equalsValue(
                currentRow.getOrderDate(),
                firstRow.getOrderDate()
        )
                && equalsValue(
                currentRow.getStatus(),
                firstRow.getStatus()
        )
                && equalsValue(
                currentRow.getPayment(),
                firstRow.getPayment()
        );
    }

    /*
     * Add an error for every order-level field that changed.
     */
    private void checkOrderConsistency(
            List<AdminExcelImportErrorDTO> errors,
            int excelRowNumber,
            AdminExcelOrderRowDTO currentRow,
            AdminExcelOrderRowDTO firstRow
    ) {

        if (!equalsValue(
                currentRow.getSystemUsername(),
                firstRow.getSystemUsername()
        )) {

            addError(
                    errors,
                    excelRowNumber,
                    currentRow.getOrderRef(),
                    "System User",
                    currentRow.getSystemUsername(),
                    "All rows with the same Order Ref must have the same System User."
            );
        }

        if (!equalsValue(
                currentRow.getShopName(),
                firstRow.getShopName()
        )) {

            addError(
                    errors,
                    excelRowNumber,
                    currentRow.getOrderRef(),
                    "Shop",
                    currentRow.getShopName(),
                    "All rows with the same Order Ref must have the same Shop."
            );
        }

        if (!equalsValue(
                currentRow.getOrderDate(),
                firstRow.getOrderDate()
        )) {

            addError(
                    errors,
                    excelRowNumber,
                    currentRow.getOrderRef(),
                    "Order Date",
                    String.valueOf(currentRow.getOrderDate()),
                    "All rows with the same Order Ref must have the same Order Date."
            );
        }

        if (!equalsValue(
                currentRow.getStatus(),
                firstRow.getStatus()
        )) {

            addError(
                    errors,
                    excelRowNumber,
                    currentRow.getOrderRef(),
                    "Status",
                    currentRow.getStatus(),
                    "All rows with the same Order Ref must have the same Status."
            );
        }

        if (!equalsValue(
                currentRow.getPayment(),
                firstRow.getPayment()
        )) {

            addError(
                    errors,
                    excelRowNumber,
                    currentRow.getOrderRef(),
                    "Payment",
                    currentRow.getPayment(),
                    "All rows with the same Order Ref must have the same Payment."
            );
        }
    }

    private boolean equalsValue(
            Object first,
            Object second
    ) {

        if (first == null && second == null) {
            return true;
        }

        if (first == null || second == null) {
            return false;
        }

        return first.equals(second);
    }

    private boolean isValidStatus(String status) {

        if (status == null) {
            return false;
        }

        return status.trim()
                .toUpperCase(Locale.ROOT)
                .equals("PAID")
                || status.trim()
                .toUpperCase(Locale.ROOT)
                .equals("ACTIVE")
                || status.trim()
                .toUpperCase(Locale.ROOT)
                .equals("CANCELLED");
    }

    private boolean isValidPayment(String payment) {

        if (payment == null) {
            return false;
        }

        return payment.trim()
                .toUpperCase(Locale.ROOT)
                .equals("CASH")
                || payment.trim()
                .toUpperCase(Locale.ROOT)
                .equals("ONLINE");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void addError(
            List<AdminExcelImportErrorDTO> errors,
            int rowNumber,
            String orderRef,
            String column,
            String value,
            String error
    ) {

        errors.add(
                new AdminExcelImportErrorDTO(
                        rowNumber,
                        orderRef,
                        column,
                        value,
                        error
                )
        );
    }
}