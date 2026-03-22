package com.carrent.carservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    public static final String EXCHANGE = "credit.exchange";
    public static final String CREDIT_CHECK_REQUEST_QUEUE = "credit.check.request.queue";
    public static final String CREDIT_CHECK_RESPONSE_QUEUE = "credit.check.response.queue";
    public static final String CREDIT_CHECK_REQUEST_KEY = "credit.check.request";
    public static final String CREDIT_CHECK_RESPONSE_KEY = "credit.check.response";

    @Bean
    public DirectExchange creditExchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public Queue creditCheckResponseQueue() {
        return new Queue(CREDIT_CHECK_RESPONSE_QUEUE, true);
    }

    @Bean
    public Binding creditCheckResponseBinding(Queue creditCheckResponseQueue, DirectExchange creditExchange) {
        return BindingBuilder.bind(creditCheckResponseQueue).to(creditExchange).with(CREDIT_CHECK_RESPONSE_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
