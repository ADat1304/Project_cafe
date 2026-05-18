package com.order_service.demo.repository;

import com.order_service.demo.entity.PaymentMethod;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

@ApplicationScoped
public class PaymentMethodRepository implements PanacheRepositoryBase<PaymentMethod, String> {
    public Optional<PaymentMethod> findByPaymentMethodType(String paymentMethodType) {
        return find("paymentMethodType", paymentMethodType).firstResultOptional();
    }
}
