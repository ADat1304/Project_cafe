package com.example.demo_database.feature.product.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Entity
@Table(name = "Category")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Category {
    @Id
    @Column(name = "categoryID", length = 36)
    String categoryID; // nếu bạn muốn UUID, thay sang UUID tương tự Product

    @Column(name = "categoryName", length = 100, nullable = false)
    String categoryName;

    @OneToMany(mappedBy = "category")
    List<Product> products;
}
