package com.example.cafe.products.repository;

import com.example.cafe.products.entity.Product;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

@ApplicationScoped
public class ProductRepository implements PanacheRepositoryBase<Product, String> {
    
    public Optional<Product> findByProductName(String productName) {
        return find("productName", productName).firstResultOptional();
    }
    
    public boolean existsByProductName(String productName) {
        return count("productName", productName) > 0;
    }
}
