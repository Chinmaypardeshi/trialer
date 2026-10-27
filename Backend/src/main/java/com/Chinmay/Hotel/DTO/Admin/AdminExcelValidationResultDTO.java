package com.Chinmay.Hotel.DTO.Admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
//Represnts when the entire excel is validated but still doesnt get imported or inserted because validation failed
public class AdminExcelValidationResultDTO {
    private boolean valid;

    private int totalRows;

    private int validRows;

    private List<AdminExcelImportErrorDTO> errors = new ArrayList<>();
    
}
