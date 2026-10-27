package com.Chinmay.Hotel.Service.Admin;

import com.Chinmay.Hotel.DTO.Admin.AdminExcelOrderRowDTO;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminExcelOrderReader {

    public List<AdminExcelOrderRowDTO> readExcel(
            MultipartFile file
    ) throws IOException {

        List<AdminExcelOrderRowDTO> rows = new ArrayList<>();

        try (
                InputStream inputStream = file.getInputStream();
                Workbook workbook = WorkbookFactory.create(inputStream)
        ) {

            Sheet sheet = workbook.getSheetAt(0);

            DataFormatter formatter = new DataFormatter();

            /*
             * Previous order-level values.
             *
             * Blank cells in these columns inherit
             * the previous value.
             */
            String previousSystemUsername = null;
            String previousShopName = null;
            String previousOrderRef = null;
            LocalDateTime previousOrderDate = null;
            String previousStatus = null;
            String previousPayment = null;

            boolean firstRow = true;

            for (Row row : sheet) {

                /*
                 * Skip header row.
                 */
                if (firstRow) {
                    firstRow = false;
                    continue;
                }

                /*
                 * Skip completely empty rows.
                 */
                if (isEmptyRow(row)) {
                    continue;
                }

                String systemUsername =
                        getStringValue(
                                row.getCell(0),
                                formatter
                        );

                String shopName =
                        getStringValue(
                                row.getCell(1),
                                formatter
                        );

                String orderRef =
                        getStringValue(
                                row.getCell(2),
                                formatter
                        );

                LocalDateTime orderDate =
                        getDateTimeValue(
                                row.getCell(3)
                        );

                String status =
                        getStringValue(
                                row.getCell(4),
                                formatter
                        );

                String payment =
                        getStringValue(
                                row.getCell(5),
                                formatter
                        );

                /*
                 * Item-level fields.
                 *
                 * These are NOT inherited.
                 */
                String menuGroupName =
                        getStringValue(
                                row.getCell(6),
                                formatter
                        );

                String menuItemName =
                        getStringValue(
                                row.getCell(7),
                                formatter
                        );

                Integer quantity =
                        getIntegerValue(
                                row.getCell(8)
                        );

                BigDecimal price =
                        getBigDecimalValue(
                                row.getCell(9)
                        );

                /*
                 * ORDER-LEVEL INHERITANCE
                 */

                if (isBlank(systemUsername)) {
                    systemUsername = previousSystemUsername;
                } else {
                    previousSystemUsername = systemUsername;
                }

                if (isBlank(shopName)) {
                    shopName = previousShopName;
                } else {
                    previousShopName = shopName;
                }

                if (isBlank(orderRef)) {
                    orderRef = previousOrderRef;
                } else {
                    previousOrderRef = orderRef;
                }

                if (orderDate == null) {
                    orderDate = previousOrderDate;
                } else {
                    previousOrderDate = orderDate;
                }

                if (isBlank(status)) {
                    status = previousStatus;
                } else {
                    previousStatus = status;
                }

                if (isBlank(payment)) {
                    payment = previousPayment;
                } else {
                    previousPayment = payment;
                }

                /*
                 * Create normalized DTO.
                 */
                AdminExcelOrderRowDTO dto =
                        new AdminExcelOrderRowDTO(
                                systemUsername,
                                shopName,
                                orderRef,
                                orderDate,
                                status,
                                payment,
                                menuGroupName,
                                menuItemName,
                                quantity,
                                price
                        );

                rows.add(dto);
            }
        }

        return rows;
    }

    private String getStringValue(
            Cell cell,
            DataFormatter formatter
    ) {

        if (cell == null) {
            return null;
        }

        String value =
                formatter.formatCellValue(cell);

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private LocalDateTime getDateTimeValue(Cell cell) {

        if (cell == null ||
                cell.getCellType() == CellType.BLANK) {

            return null;
        }

        if (cell.getCellType() == CellType.NUMERIC &&
                DateUtil.isCellDateFormatted(cell)) {

            return cell
                    .getDateCellValue()
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
        }

        return null;
    }

    private Integer getIntegerValue(Cell cell) {

        if (cell == null ||
                cell.getCellType() == CellType.BLANK) {

            return null;
        }

        if (cell.getCellType() == CellType.NUMERIC) {

            return (int) cell.getNumericCellValue();
        }

        String value = cell.toString();

        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return Integer.valueOf(value.trim());

        } catch (NumberFormatException e) {
            return null;
        }
    }

    private BigDecimal getBigDecimalValue(Cell cell) {

        if (cell == null ||
                cell.getCellType() == CellType.BLANK) {

            return null;
        }

        if (cell.getCellType() == CellType.NUMERIC) {

            return BigDecimal.valueOf(
                    cell.getNumericCellValue()
            );
        }

        String value = cell.toString();

        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return new BigDecimal(value.trim());

        } catch (NumberFormatException e) {
            return null;
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private boolean isEmptyRow(Row row) {

        for (int i = 0; i < 10; i++) {

            Cell cell = row.getCell(i);

            if (cell != null &&
                    cell.getCellType() != CellType.BLANK &&
                    !cell.toString().isBlank()) {

                return false;
            }
        }

        return true;
    }
}