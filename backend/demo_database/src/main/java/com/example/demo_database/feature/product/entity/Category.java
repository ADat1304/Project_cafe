package com.example.demo_database.feature.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "Category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @Column(name = "categoryID", length = 36)
    private String categoryID; // nếu bạn muốn UUID, thay sang UUID tương tự Product

    @Column(name = "categoryName", length = 100, nullable = false)
    private String categoryName;

    @OneToMany(mappedBy = "category")
    private List<Product> products;
}
