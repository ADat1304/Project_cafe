package com.example.demo_database.feature.product.dto.request;


import com.example.demo_database.feature.product.entity.Category;
import com.example.demo_database.feature.product.entity.Image;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.autoconfigure.cache.CacheType;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductCreationRequest {
    String productName;

    @Size(min = 5000,message = "Price_Invalid")
    BigDecimal price = BigDecimal.ZERO;
    Integer amont;
    String category;
    List<String> images;
}
