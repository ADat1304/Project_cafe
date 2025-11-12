package com.example.demo_database.feature.product.service;

import com.example.demo_database.common.exception.AppException;
import com.example.demo_database.common.exception.ErrorCode;
import com.example.demo_database.feature.product.dto.reponse.ProductReponse;
import com.example.demo_database.feature.product.dto.request.ProductCreationRequest;
import com.example.demo_database.feature.product.entity.Image;
import com.example.demo_database.feature.product.entity.Product;
import com.example.demo_database.feature.product.mapper.ProductMapper;
import com.example.demo_database.feature.product.repository.ProductRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductService {
    ProductRepository productRepository;
    ProductMapper productMapper;

    public ProductReponse createProduct(ProductCreationRequest request){
        if(productRepository.existsByMame(request.getProductName()))
            throw new AppException(ErrorCode.PRODUCT_EXISTED);

        Product product = productMapper.toProduct(request);
        List<String> images= request.getImages();
        for(String i:images){
            product.setImages(new Image(i));
        }
    }
}
