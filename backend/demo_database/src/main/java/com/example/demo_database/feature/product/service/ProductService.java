package com.example.demo_database.feature.product.service;

import com.example.demo_database.common.exception.AppException;
import com.example.demo_database.common.exception.ErrorCode;
import com.example.demo_database.feature.product.dto.request.ProductCreationRequest;
import com.example.demo_database.feature.product.dto.response.ProductResponse;
import com.example.demo_database.feature.product.entity.Image;
import com.example.demo_database.feature.product.entity.Product;
import com.example.demo_database.feature.product.mapper.ProductMapper;
import com.example.demo_database.feature.product.repository.ProductRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductService {
    ProductRepository productRepository;
    ProductMapper productMapper;

    public ProductResponse createProduct(ProductCreationRequest request){
        if(productRepository.existsByProductName(request.getProductName()))
            throw new AppException(ErrorCode.PRODUCT_EXISTED);

        Product product = productMapper.toProduct(request);
        if (Objects.nonNull(request.getImages()) && !request.getImages().isEmpty()) {
            List<Image> images = request.getImages().stream()
                    .map(link -> Image.builder().imageLink(link).product(product).build())
                    .collect(Collectors.toList());
            product.setImages(images);
        }

        Product savedProduct = productRepository.save(product);
        return productMapper.toProductResponse(savedProduct);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::toProductResponse)
                .collect(Collectors.toList());
    }
}
