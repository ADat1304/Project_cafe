package com.example.cafe.products.mapper;

import com.example.cafe.products.dto.request.ProductCreationRequest;
import com.example.cafe.products.dto.response.ProductResponse;
import com.example.cafe.products.entity.Image;
import com.example.cafe.products.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA)
public interface ProductMapper {

    @Mapping(target = "productID", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "images", ignore = true)
    Product toProduct(ProductCreationRequest request);

    @Mapping(target = "categoryName", source = "category.categoryName")
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
}
