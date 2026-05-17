package com.example.cafe.products.scraper;

import java.math.BigDecimal;

public record HighlandsProduct(String categoryName,
                               String productName,
                               BigDecimal price,
                               String imageUrl) {
}
