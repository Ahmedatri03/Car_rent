package com.carrent.carservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Car {
    private Long id;
    private String type;
    private Double rentalPricePerDay;
    private Double carPrice;
    private String brand;
    private String model;
    private String purchaseDate;
    private Integer maxPassengers;
    private Integer maxSpeed;
    private boolean airConditioner;
    private boolean automaticTransmission;
    private Double pricePerDay;
    private boolean available;
}
