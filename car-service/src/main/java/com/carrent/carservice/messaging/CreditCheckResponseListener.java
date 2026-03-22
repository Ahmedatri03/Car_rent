package com.carrent.carservice.messaging;

import com.carrent.carservice.config.RabbitConfig;
import com.carrent.carservice.dto.CreditCheckResponse;
import com.carrent.carservice.service.BookingService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class CreditCheckResponseListener {
    private final BookingService bookingService;

    public CreditCheckResponseListener(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @RabbitListener(queues = RabbitConfig.CREDIT_CHECK_RESPONSE_QUEUE)
    public void onCreditResponse(CreditCheckResponse response) {
        bookingService.handleCreditResponse(response);
    }
}
