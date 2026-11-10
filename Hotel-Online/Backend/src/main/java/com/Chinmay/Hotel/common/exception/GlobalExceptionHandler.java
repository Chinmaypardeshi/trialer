package com.Chinmay.Hotel.common.exception;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(
            DataIntegrityViolationException exception,
            HttpServletRequest request) {

        if (isDuplicateFileHashViolation(exception)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "timestamp", OffsetDateTime.now().toString(),
                            "status", 409,
                            "error", "Conflict",
                            "message",
                            "This Excel file has already been imported.",
                            "path", request.getRequestURI()
                    ));
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "timestamp", OffsetDateTime.now().toString(),
                        "status", 500,
                        "error", "Internal Server Error",
                        "message", "A database integrity error occurred.",
                        "path", request.getRequestURI()
                ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException exception,
            HttpServletRequest request) {

        String message = exception.getMessage();
        if (message != null && (message.contains("Can't open workbook") || message.contains("unsupported file type"))) {
            message = "Invalid Excel file format or corrupted file.";
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "timestamp", OffsetDateTime.now().toString(),
                        "status", 400,
                        "error", "Bad Request",
                        "message", message != null && !message.isBlank()
                                ? message
                                : "Invalid Excel file or input.",
                        "path", request.getRequestURI()
                ));
    }

    @ExceptionHandler(org.apache.poi.UnsupportedFileFormatException.class)
    public ResponseEntity<Map<String, Object>> handleUnsupportedFileFormat(
            org.apache.poi.UnsupportedFileFormatException exception,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "timestamp", OffsetDateTime.now().toString(),
                        "status", 400,
                        "error", "Bad Request",
                        "message", "Invalid Excel file format or corrupted file.",
                        "path", request.getRequestURI()
                ));
    }

    private boolean isDuplicateFileHashViolation(Throwable exception) {

        Throwable current = exception;

        while (current != null) {
            String message = current.getMessage();

            if (message != null) {
                String lowerMessage = message.toLowerCase();

                if (lowerMessage.contains("uk_excel_import_file_hash")
                        && (lowerMessage.contains("duplicate")
                        || lowerMessage.contains("unique"))) {
                    return true;
                }
            }

            current = current.getCause();
        }

        return false;
    }
}
