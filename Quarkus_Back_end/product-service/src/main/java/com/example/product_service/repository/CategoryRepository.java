package com.example.product_service.repository;

import com.example.product_service.entity.Category;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

@ApplicationScoped
public class CategoryRepository implements PanacheRepositoryBase<Category, String> {
    
    public Optional<Category> findByCategoryName(String categoryName) {
        return find("categoryName", categoryName).firstResultOptional();
    }
}
