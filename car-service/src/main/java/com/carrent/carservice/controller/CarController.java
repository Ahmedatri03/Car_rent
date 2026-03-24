package com.carrent.carservice.controller;

import com.carrent.carservice.model.Car;
import com.carrent.carservice.service.CarService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174"
        },
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
)
@RequestMapping("/api/cars")
public class CarController {
    private final CarService carService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    @PostMapping
    public ResponseEntity<Car> create(@RequestBody Car car) {
        return ResponseEntity.ok(carService.create(car));
    }

    @GetMapping
    public ResponseEntity<List<Car>> list() {
        return ResponseEntity.ok(carService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Car> get(@PathVariable Long id) {
        Car car = carService.findById(id);
        return car == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(car);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Car> update(@PathVariable Long id, @RequestBody Car car) {
        Car updated = carService.update(id, car);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return carService.delete(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    /**
     * Remet toutes les voitures en disponibilité (non occupées).
     */
    @PostMapping("/availability/available")
    public ResponseEntity<Map<String, Integer>> setAllAvailable() {
        int updated = carService.setAllAvailability(true);
        return ResponseEntity.ok(Map.of("updated", updated));
    }

    /**
     * Remet une voiture précise en disponibilité (non occupée).
     */
    @PostMapping("/{id}/availability/available")
    public ResponseEntity<Map<String, Integer>> setOneAvailable(@PathVariable Long id) {
        Car car = carService.findById(id);
        if (car == null) {
            return ResponseEntity.notFound().build();
        }
        carService.setAvailability(id, true);
        return ResponseEntity.ok(Map.of("updated", 1));
    }
}
