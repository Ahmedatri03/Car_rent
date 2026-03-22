package com.carrent.carservice.service;

import com.carrent.carservice.model.Car;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class CarService {
    private final Map<Long, Car> cars = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(1);

    public Car create(Car car) {
        long id = sequence.getAndIncrement();
        car.setId(id);
        if (car.getRentalPricePerDay() == null && car.getPricePerDay() != null) {
            car.setRentalPricePerDay(car.getPricePerDay());
        }
        if (car.getPricePerDay() == null && car.getRentalPricePerDay() != null) {
            car.setPricePerDay(car.getRentalPricePerDay());
        }
        if (!car.isAvailable()) {
            car.setAvailable(true);
        }
        cars.put(id, car);
        return car;
    }

    public List<Car> findAll() {
        return new ArrayList<>(cars.values());
    }

    public Car findById(Long id) {
        return cars.get(id);
    }

    public Car update(Long id, Car updated) {
        Car existing = cars.get(id);
        if (existing == null) {
            return null;
        }
        existing.setType(updated.getType());
        existing.setRentalPricePerDay(updated.getRentalPricePerDay());
        existing.setCarPrice(updated.getCarPrice());
        existing.setBrand(updated.getBrand());
        existing.setModel(updated.getModel());
        existing.setPurchaseDate(updated.getPurchaseDate());
        existing.setMaxPassengers(updated.getMaxPassengers());
        existing.setMaxSpeed(updated.getMaxSpeed());
        existing.setAirConditioner(updated.isAirConditioner());
        existing.setAutomaticTransmission(updated.isAutomaticTransmission());
        existing.setPricePerDay(updated.getPricePerDay());
        if (existing.getPricePerDay() == null && existing.getRentalPricePerDay() != null) {
            existing.setPricePerDay(existing.getRentalPricePerDay());
        }
        if (existing.getRentalPricePerDay() == null && existing.getPricePerDay() != null) {
            existing.setRentalPricePerDay(existing.getPricePerDay());
        }
        existing.setAvailable(updated.isAvailable());
        return existing;
    }

    public boolean delete(Long id) {
        return cars.remove(id) != null;
    }

    public void setAvailability(Long id, boolean available) {
        Car car = cars.get(id);
        if (car != null) {
            car.setAvailable(available);
        }
    }
}
