package com.example.demo_database.feature.product.mapper;

import com.example.demo_database.feature.product.dto.reponse.ProductReponse;
import com.example.demo_database.feature.product.dto.request.ProductCreationRequest;
import com.example.demo_database.feature.product.entity.Product;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    Product toProduct(ProductCreationRequest request);

    ProductReponse toProductReponse(Product product);

}
