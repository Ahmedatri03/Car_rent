package com.carrent.bankservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BankAccount {
    private Long id;
    private Long userId;
    private String ownerName;
    private Double balance;
}
