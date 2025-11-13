package com.example.demo_database.feature.product.repository;


import com.example.demo_database.feature.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface ProductRepository extends JpaRepository<Product, String> {
    boolean existsByProductName(String productName);
    Optional<Product> findByProductName(String productName);
}
