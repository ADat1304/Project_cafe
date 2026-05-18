package com.order_service.demo.repository;

import com.order_service.demo.entity.CafeTable;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

@ApplicationScoped
public class CafeTableRepository implements PanacheRepositoryBase<CafeTable, String> {
    public Optional<CafeTable> findByTableNumber(String tableNumber) {
        return find("tableNumber", tableNumber).firstResultOptional();
    }
}