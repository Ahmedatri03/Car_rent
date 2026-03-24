package com.carrent.carservice.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cars")
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
