package com.order_service.demo.repository;

import com.order_service.demo.entity.Orders;
import com.order_service.demo.dto.response.TopProductResponse;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class OrderRepository implements PanacheRepositoryBase<Orders, String> {

    public BigDecimal sumTotalAmountByOrderDateBetweenAndStatus(LocalDateTime start, LocalDateTime end, String status) {
        return getEntityManager().createQuery(
            "SELECT COALESCE(SUM(o.totalAmount), 0) FROM Orders o WHERE o.orderDate >= :start AND o.orderDate < :end AND o.status = :status", BigDecimal.class)
            .setParameter("start", start)
            .setParameter("end", end)
            .setParameter("status", status)
            .getSingleResult();
    }

    public long countByOrderDateBetweenAndStatus(LocalDateTime start, LocalDateTime end, String status) {
        return count("orderDate >= ?1 and orderDate < ?2 and status = ?3", start, end, status);
    }

    public List<TopProductResponse> findTopSellingProducts(int limit) {
        return getEntityManager().createQuery(
            "SELECT new com.order_service.demo.dto.response.TopProductResponse(d.productId, d.productName, SUM(d.quantity)) " +
            "FROM OrderDetail d " +
            "GROUP BY d.productId, d.productName " +
            "ORDER BY SUM(d.quantity) DESC", TopProductResponse.class)
            .setMaxResults(limit)
            .getResultList();
    }
}
