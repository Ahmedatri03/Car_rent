package com.carrent.carservice.service;

import com.carrent.carservice.config.RabbitConfig;
import com.carrent.carservice.dto.CreateBookingRequest;
import com.carrent.carservice.dto.CreditCheckRequest;
import com.carrent.carservice.dto.CreditCheckResponse;
import com.carrent.carservice.model.Booking;
import com.carrent.carservice.model.BookingStatus;
import com.carrent.carservice.model.Car;
import com.carrent.carservice.repository.BookingRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final CarService carService;
    private final RabbitTemplate rabbitTemplate;

    public BookingService(BookingRepository bookingRepository, CarService carService, RabbitTemplate rabbitTemplate) {
        this.bookingRepository = bookingRepository;
        this.carService = carService;
        this.rabbitTemplate = rabbitTemplate;
    }

    public Booking create(CreateBookingRequest request) {
        Car car = carService.findById(request.getCarId());
        if (car == null || !car.isAvailable()) {
            return null;
        }

        Double unitPrice = car.getPricePerDay() != null ? car.getPricePerDay() : car.getRentalPricePerDay();
        if (unitPrice == null || unitPrice <= 0.0d) {
            return null;
        }
        double total = unitPrice * request.getDays();

        Booking booking = new Booking(
                null,
                request.getUserId(),
                request.getCarId(),
                request.getDays(),
                total,
                BookingStatus.PENDING
        );
        Booking saved = bookingRepository.save(booking);

        CreditCheckRequest checkRequest = new CreditCheckRequest(saved.getId(), request.getUserId(), total);
        rabbitTemplate.convertAndSend(
                RabbitConfig.EXCHANGE,
                RabbitConfig.CREDIT_CHECK_REQUEST_KEY,
                checkRequest
        );

        return saved;
    }

    public List<Booking> findAll() {
        return bookingRepository.findAll();
    }

    public Booking findById(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    public void handleCreditResponse(CreditCheckResponse response) {
        Booking booking = findById(response.getBookingId());
        if (booking == null) {
            return;
        }

        if (response.isApproved()) {
            booking.setStatus(BookingStatus.APPROVED);
            carService.setAvailability(booking.getCarId(), false);
        } else {
            booking.setStatus(BookingStatus.REFUSED);
        }
        bookingRepository.save(booking);
    }
}
