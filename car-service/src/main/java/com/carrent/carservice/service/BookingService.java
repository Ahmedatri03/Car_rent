package com.carrent.carservice.service;

import com.carrent.carservice.config.RabbitConfig;
import com.carrent.carservice.dto.CreateBookingRequest;
import com.carrent.carservice.dto.CreditCheckRequest;
import com.carrent.carservice.dto.CreditCheckResponse;
import com.carrent.carservice.model.Booking;
import com.carrent.carservice.model.BookingStatus;
import com.carrent.carservice.model.Car;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class BookingService {
    private final Map<Long, Booking> bookings = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(1);
    private final CarService carService;
    private final RabbitTemplate rabbitTemplate;

    public BookingService(CarService carService, RabbitTemplate rabbitTemplate) {
        this.carService = carService;
        this.rabbitTemplate = rabbitTemplate;
    }

    public Booking create(CreateBookingRequest request) {
        Car car = carService.findById(request.getCarId());
        if (car == null || !car.isAvailable()) {
            return null;
        }

        long id = sequence.getAndIncrement();
        double total = car.getPricePerDay() * request.getDays();

        Booking booking = new Booking(
                id,
                request.getUserId(),
                request.getCarId(),
                request.getDays(),
                total,
                BookingStatus.PENDING
        );
        bookings.put(id, booking);

        CreditCheckRequest checkRequest = new CreditCheckRequest(id, request.getUserId(), total);
        rabbitTemplate.convertAndSend(
                RabbitConfig.EXCHANGE,
                RabbitConfig.CREDIT_CHECK_REQUEST_KEY,
                checkRequest
        );

        return booking;
    }

    public List<Booking> findAll() {
        return new ArrayList<>(bookings.values());
    }

    public Booking findById(Long id) {
        return bookings.get(id);
    }

    public void handleCreditResponse(CreditCheckResponse response) {
        Booking booking = bookings.get(response.getBookingId());
        if (booking == null) {
            return;
        }

        if (response.isApproved()) {
            booking.setStatus(BookingStatus.APPROVED);
            carService.setAvailability(booking.getCarId(), false);
        } else {
            booking.setStatus(BookingStatus.REFUSED);
        }
    }
}
