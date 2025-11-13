package com.example.demo_database.feature.product.mapper;

import com.example.demo_database.feature.product.dto.request.ProductCreationRequest;
import com.example.demo_database.feature.product.dto.response.ProductResponse;
import com.example.demo_database.feature.product.entity.Image;
import com.example.demo_database.feature.product.entity.Product;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(target = "productID", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "images", ignore = true)
    Product toProduct(ProductCreationRequest request);

    @Mapping(target = "productId", source = "productID")
    @Mapping(target = "categoryId", expression = "java(product.getCategory() != null ? product.getCategory().getCategoryID() : null)")
    @Mapping(target = "images", expression = "java(extractImageLinks(product))")
    ProductResponse toProductResponse(Product product);

    default List<String> extractImageLinks(Product product) {
        if (Objects.isNull(product.getImages())) {
            return Collections.emptyList();
        }
        return product.getImages().stream()
                .map(Image::getImageLink)
                .collect(Collectors.toList());
    }

    @AfterMapping
    default void trimProductName(@MappingTarget Product product) {
        if (product.getProductName() != null) {
            product.setProductName(product.getProductName().trim());
        }
    }

}
