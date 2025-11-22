package com.order_service.demo.repository;

import com.order_service.demo.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Orders,String> {

}
