package com.carrent.carservice.service;

import com.carrent.carservice.model.Car;
import com.carrent.carservice.repository.CarRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarService {
    private final CarRepository carRepository;

    public CarService(CarRepository carRepository) {
        this.carRepository = carRepository;
    }

    public Car create(Car car) {
        if (car.getRentalPricePerDay() == null && car.getPricePerDay() != null) {
            car.setRentalPricePerDay(car.getPricePerDay());
        }
        if (car.getPricePerDay() == null && car.getRentalPricePerDay() != null) {
            car.setPricePerDay(car.getRentalPricePerDay());
        }
        car.setAvailable(true);
        return carRepository.save(car);
    }

    public List<Car> findAll() {
        return carRepository.findAll();
    }

    public Car findById(Long id) {
        return carRepository.findById(id).orElse(null);
    }

    public Car update(Long id, Car updated) {
        Car existing = findById(id);
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
        return carRepository.save(existing);
    }

    public boolean delete(Long id) {
        if (!carRepository.existsById(id)) {
            return false;
        }
        carRepository.deleteById(id);
        return true;
    }

    public void setAvailability(Long id, boolean available) {
        Car car = findById(id);
        if (car != null) {
            car.setAvailable(available);
            carRepository.save(car);
        }
    }

    /**
     * Met à jour la disponibilité de toutes les voitures.
     * Retourne le nombre de voitures réellement modifiées.
     */
    public int setAllAvailability(boolean available) {
        int updated = 0;
        List<Car> allCars = carRepository.findAll();
        for (Car car : allCars) {
            if (car.isAvailable() != available) {
                car.setAvailable(available);
                updated++;
            }
        }
        carRepository.saveAll(allCars);
        return updated;
    }
}
