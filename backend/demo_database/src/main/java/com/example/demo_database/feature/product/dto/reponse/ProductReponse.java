package com.example.demo_database.feature.product.dto.reponse;

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
public class ProductReponse {
    String productName;
    BigDecimal price = BigDecimal.ZERO;
    Integer amont;
    Category category;
    List<Image> images;
}