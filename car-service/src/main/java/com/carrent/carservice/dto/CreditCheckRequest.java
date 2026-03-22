package com.carrent.carservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCheckRequest {
    private Long bookingId;
    private Long userId;
    private Double amount;
}
