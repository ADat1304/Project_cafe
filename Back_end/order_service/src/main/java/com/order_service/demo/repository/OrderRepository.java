package com.order_service.demo.repository;

import com.order_service.demo.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Orders,String> {
    @Override
    Optional<Orders> findById(String OrderId);
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Orders o WHERE o.orderDate >= :start AND o.orderDate < :end")
    BigDecimal sumTotalAmountByOrderDateBetween(@Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end);

    long countByOrderDateBetween(LocalDateTime start, LocalDateTime end);
}
