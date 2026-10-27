package com.Chinmay.Hotel.DTO.Admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
//Represents one validation error for a specific row in the Excel file
public class AdminExcelImportErrorDTO {

    private int rowNumber;

    private String orderRef;

    private String column;

    private String value;

    private String error;
}