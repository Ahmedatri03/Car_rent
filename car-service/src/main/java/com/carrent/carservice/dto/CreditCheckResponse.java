package com.carrent.carservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCheckResponse {
    private Long bookingId;
    private boolean approved;
    private String reason;
}
