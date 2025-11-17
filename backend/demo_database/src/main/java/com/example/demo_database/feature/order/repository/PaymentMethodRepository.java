package com.example.demo_database.feature.order.repository;

import com.example.demo_database.feature.order.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, String> {
    Optional<PaymentMethod> findByPaymentMethodType(String paymentMethodType);
}
