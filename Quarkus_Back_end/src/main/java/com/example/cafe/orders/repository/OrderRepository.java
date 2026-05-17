package com.example.cafe.orders.repository;

import com.example.cafe.orders.entity.Orders;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import com.example.cafe.orders.dto.response.TopProductResponse;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class OrderRepository implements PanacheRepositoryBase<Orders, String> {

    public BigDecimal sumTotalAmountByOrderDateBetweenAndStatus(LocalDateTime start, LocalDateTime end, String status) {
        BigDecimal result = getEntityManager().createQuery(
                "SELECT SUM(o.totalAmount) FROM Orders o WHERE o.orderDate >= :start AND o.orderDate < :end AND o.status = :status", BigDecimal.class)
                .setParameter("start", start)
                .setParameter("end", end)
                .setParameter("status", status)
                .getSingleResult();
        return result != null ? result : BigDecimal.ZERO;
    }

    public long countByOrderDateBetweenAndStatus(LocalDateTime start, LocalDateTime end, String status) {
        return count("orderDate >= ?1 and orderDate < ?2 and status = ?3", start, end, status);
    }

    public List<TopProductResponse> findTopSellingProducts(int limit) {
        return getEntityManager().createQuery(
                "SELECT new com.example.cafe.orders.dto.response.TopProductResponse(d.productId, d.productName, SUM(d.quantity)) " +
                "FROM OrderDetail d " +
                "GROUP BY d.productId, d.productName " +
                "ORDER BY SUM(d.quantity) DESC", TopProductResponse.class)
                .setMaxResults(limit)
                .getResultList();
    }
}
