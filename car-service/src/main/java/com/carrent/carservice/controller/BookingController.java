package com.carrent.carservice.controller;

import com.carrent.carservice.dto.CreateBookingRequest;
import com.carrent.carservice.model.Booking;
import com.carrent.carservice.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateBookingRequest request) {
        Booking created = bookingService.create(request);
        if (created == null) {
            return ResponseEntity.badRequest().body("Car not found or unavailable");
        }
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Booking>> list() {
        return ResponseEntity.ok(bookingService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> get(@PathVariable Long id) {
        Booking booking = bookingService.findById(id);
        return booking == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(booking);
    }
}
