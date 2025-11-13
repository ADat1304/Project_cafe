package com.example.demo_database.feature.product.dto.request;


import com.example.demo_database.feature.product.entity.Category;
import com.example.demo_database.feature.product.entity.Image;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
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

    @NotNull(message = "PRICE_REQUIRED")
    @DecimalMin(value = "0.0", inclusive = false, message = "PRICE_INVALID")
    BigDecimal price;

    @NotNull(message = "AMOUNT_REQUIRED")
    @PositiveOrZero(message = "AMOUNT_INVALID")
    Integer amount;

    String categoryId;

    List<String> images;

}
