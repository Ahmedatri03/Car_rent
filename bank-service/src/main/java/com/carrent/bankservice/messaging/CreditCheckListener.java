package com.carrent.bankservice.messaging;

import com.carrent.bankservice.config.RabbitConfig;
import com.carrent.bankservice.dto.CreditCheckRequest;
import com.carrent.bankservice.dto.CreditCheckResponse;
import com.carrent.bankservice.service.BankAccountService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class CreditCheckListener {
    private final BankAccountService bankAccountService;
    private final RabbitTemplate rabbitTemplate;

    public CreditCheckListener(BankAccountService bankAccountService, RabbitTemplate rabbitTemplate) {
        this.bankAccountService = bankAccountService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitConfig.CREDIT_CHECK_REQUEST_QUEUE)
    public void onCreditCheck(CreditCheckRequest request) {
        boolean approved = bankAccountService.debit(request.getUserId(), request.getAmount());
        CreditCheckResponse response = new CreditCheckResponse(
                request.getBookingId(),
                approved,
                approved ? "Approved" : "Insufficient balance or account not found"
        );

        rabbitTemplate.convertAndSend(
                RabbitConfig.EXCHANGE,
                RabbitConfig.CREDIT_CHECK_RESPONSE_KEY,
                response
        );
    }
}
