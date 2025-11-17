package com.example.demo_database.feature.order.repository;


import com.example.demo_database.feature.order.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Orders, String> {
}