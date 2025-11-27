package com.order_service.demo.repository;

import com.order_service.demo.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Orders,String> {
    @Override
    Optional<Orders> findById(String OrderId);
}
