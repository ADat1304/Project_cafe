package com.example.product_service.repository;

import com.example.product_service.entity.Product;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ProductRepository implements PanacheRepositoryBase<Product, String> {
    public boolean existsByProductName(String productName) {
        return count("productName", productName) > 0;
    }

    public List<Product> findByCategory_CategoryNameIgnoreCase(String categoryName) {
        return list("LOWER(category.categoryName) = LOWER(?1)", categoryName);
    }

    public Optional<Product> findByProductName(String productName) {
        return find("productName", productName).firstResultOptional();
    }
}