package com.Chinmay.Hotel.order.excel.service;

import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Chinmay.Hotel.order.excel.dto.AdminExcelOrderRowDTO;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class AdminExcelOrderReader {

    private static final List<String> REQUIRED_HEADERS = List.of(
            "System User",
            "Shop",
            "Order Ref",
            "Order Date",
            "Status",
            "Payment",
            "Menu Group",
            "Menu Item",
            "Qty",
            "Price"
    );

    public List<AdminExcelOrderRowDTO> readExcel(
            MultipartFile file
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "The uploaded Excel file is empty."
            );
        }

        List<AdminExcelOrderRowDTO> rows = new ArrayList<>();

        Workbook workbook;
        try {
            workbook = WorkbookFactory.create(file.getInputStream());
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Invalid Excel file format or corrupted file.", e
            );
        }

        try (workbook) {
            if (workbook.getNumberOfSheets() == 0) {
                throw new IllegalArgumentException(
                        "The Excel workbook contains no worksheets."
                );
            }

            Sheet sheet = workbook.getSheetAt(0);

            if (isSheetEmpty(sheet)) {
                throw new IllegalArgumentException(
                        "The Excel workbook is empty."
                );
            }

            Row headerRow = sheet.getRow(0);

            validateHeaders(headerRow);

            DataFormatter formatter = new DataFormatter();

            String previousSystemUsername = null;
            String previousShopName = null;
            String previousOrderRef = null;
            LocalDateTime previousOrderDate = null;
            String previousStatus = null;
            String previousPayment = null;

            for (int rowIndex = 1;
                 rowIndex <= sheet.getLastRowNum();
                 rowIndex++) {

                Row row = sheet.getRow(rowIndex);

                if (row == null || isEmptyRow(row)) {
                    continue;
                }

                String systemUsername =
                        getStringValue(row.getCell(0), formatter);

                String shopName =
                        getStringValue(row.getCell(1), formatter);

                String orderRef =
                        getStringValue(row.getCell(2), formatter);

                LocalDateTime orderDate =
                        getDateTimeValue(row.getCell(3));

                String status =
                        getStringValue(row.getCell(4), formatter);

                String payment =
                        getStringValue(row.getCell(5), formatter);

                String menuGroupName =
                        getStringValue(row.getCell(6), formatter);

                String menuItemName =
                        getStringValue(row.getCell(7), formatter);

                Integer quantity =
                        getIntegerValue(row.getCell(8));

                BigDecimal price =
                        getBigDecimalValue(row.getCell(9));

                // Check whether this row introduces a new Order Ref.
                boolean isNewOrder = !isBlank(orderRef) && !orderRef.equals(previousOrderRef);

                if (isNewOrder) {
                    // Start of a new order: do NOT inherit previous order's fields.
                    // Keep whatever this row provided (blank/null stays blank/null).
                    previousOrderRef = orderRef;
                    previousSystemUsername = systemUsername;
                    previousShopName = shopName;
                    previousOrderDate = orderDate;
                    previousStatus = status;
                    previousPayment = payment;
                } else {
                    // Continuation of the current order: inherit missing order-level fields.
                    if (isBlank(orderRef)) {
                        orderRef = previousOrderRef;
                    }

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
                }

                rows.add(new AdminExcelOrderRowDTO(
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
                ));
            }
        }

        return rows;
    }

    private void validateHeaders(Row headerRow) {

        if (headerRow == null || isEmptyRow(headerRow)) {
            throw new IllegalArgumentException(
                    "The Excel workbook is missing its header row. Required column order: "
                            + String.join(", ", REQUIRED_HEADERS)
                            + "."
            );
        }

        DataFormatter formatter = new DataFormatter();

        List<String> rawHeaders = new ArrayList<>();
        List<String> actualHeaders = new ArrayList<>();

        for (int i = 0; i < REQUIRED_HEADERS.size(); i++) {
            String header = getStringValue(
                    headerRow.getCell(i),
                    formatter
            );

            rawHeaders.add(header == null || header.isBlank() ? "(empty)" : header);
            actualHeaders.add(normalizeHeader(header));
        }

        List<String> missingHeaders = new ArrayList<>();

        for (String requiredHeader : REQUIRED_HEADERS) {
            if (!actualHeaders.contains(normalizeHeader(requiredHeader))) {
                missingHeaders.add(requiredHeader);
            }
        }

        if (missingHeaders.size() == REQUIRED_HEADERS.size()) {
            throw new IllegalArgumentException(
                    "The Excel workbook is missing its header row. Required column order: "
                            + String.join(", ", REQUIRED_HEADERS)
                            + "."
            );
        }

        if (!missingHeaders.isEmpty()) {
            throw new IllegalArgumentException(
                    "Missing required Excel column(s): "
                            + String.join(", ", missingHeaders)
                            + ". Required column order: "
                            + String.join(", ", REQUIRED_HEADERS)
                            + "."
            );
        }

        // Require the exact expected column order because the reader
        // currently reads data using fixed column indexes.
        for (int i = 0; i < REQUIRED_HEADERS.size(); i++) {
            String expected = normalizeHeader(REQUIRED_HEADERS.get(i));
            String actual = actualHeaders.get(i);

            if (!expected.equals(actual)) {
                throw new IllegalArgumentException(
                        "Invalid Excel column order at column "
                                + (i + 1)
                                + ": found '"
                                + rawHeaders.get(i)
                                + "', but expected '"
                                + REQUIRED_HEADERS.get(i)
                                + "'."
                                + " Required column order: "
                                + String.join(", ", REQUIRED_HEADERS)
                                + "."
                );
            }
        }
    }

    private String normalizeHeader(String header) {
        if (header == null) {
            return "";
        }

        String normalized = header.trim()
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);

        // Allow common aliases for quantity and price headers
        if (normalized.equals("quantity")) {
            return "qty";
        }
        if (normalized.equals("unit price") || normalized.equals("item price") || normalized.equals("rate")) {
            return "price";
        }

        return normalized;
    }

    private String getStringValue(
            Cell cell,
            DataFormatter formatter
    ) {
        if (cell == null) {
            return null;
        }

        String value = formatter.formatCellValue(cell);

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private LocalDateTime getDateTimeValue(Cell cell) {
        if (cell == null
                || cell.getCellType() == CellType.BLANK) {
            return null;
        }

        if (cell.getCellType() == CellType.NUMERIC
                && DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue()
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
        }

        return null;
    }

    private Integer getIntegerValue(Cell cell) {
        if (cell == null
                || cell.getCellType() == CellType.BLANK) {
            return null;
        }

        if (cell.getCellType() == CellType.NUMERIC) {
            double value = cell.getNumericCellValue();

            if (value != Math.floor(value)
                    || value < Integer.MIN_VALUE
                    || value > Integer.MAX_VALUE) {
                return null;
            }

            return (int) value;
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
        if (cell == null
                || cell.getCellType() == CellType.BLANK) {
            return null;
        }

        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
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

    private boolean isSheetEmpty(Sheet sheet) {
        if (sheet == null || sheet.getPhysicalNumberOfRows() == 0) {
            return true;
        }

        for (Row row : sheet) {
            if (row != null && !isEmptyRow(row)) {
                return false;
            }
        }

        return true;
    }

    private boolean isEmptyRow(Row row) {
        if (row == null) {
            return true;
        }

        short firstCell = row.getFirstCellNum();
        if (firstCell < 0) {
            return true;
        }

        int maxCol = Math.max((int) row.getLastCellNum(), REQUIRED_HEADERS.size());
        for (int i = 0; i < maxCol; i++) {
            Cell cell = row.getCell(i);

            if (cell != null && cell.getCellType() != CellType.BLANK) {
                if (cell.getCellType() == CellType.STRING) {
                    String str = cell.getStringCellValue();
                    if (str != null && !str.trim().isEmpty()) {
                        return false;
                    }
                } else {
                    String val = cell.toString();
                    if (val != null && !val.trim().isEmpty()) {
                        return false;
                    }
                }
            }
        }

        return true;
    }
}
