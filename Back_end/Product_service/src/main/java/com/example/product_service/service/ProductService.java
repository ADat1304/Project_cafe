package com.example.product_service.service;

import com.example.product_service.common.exception.AppException;
import com.example.product_service.common.exception.ErrorCode;
import com.example.product_service.dto.request.InventoryUpdateRequest;
import com.example.product_service.dto.request.ProductCreationRequest;
import com.example.product_service.dto.response.ProductResponse;
import com.example.product_service.entity.Category;
import com.example.product_service.entity.Image;
import com.example.product_service.entity.Product;
import com.example.product_service.mapper.ProductMapper;
import com.example.product_service.repository.CategoryRepository;
import com.example.product_service.repository.ProductRepository;
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
    CategoryRepository categoryRepository;


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

        Category category = categoryRepository.findByCategoryName(request.getCategoryName())
                .orElseThrow(() -> new RuntimeException("Category not found: " + request.getCategoryName()));

        product.setCategory(category);
        Product savedProduct = productRepository.save(product);
        return productMapper.toProductResponse(savedProduct);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::toProductResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductByName(String productName) {
        Product product = productRepository.findByProductName(productName)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return productMapper.toProductResponse(product);
    }

    public ProductResponse decrementInventory(String productId, InventoryUpdateRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (product.getAmount() < request.getQuantity()) {
            throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK);
        }

        product.setAmount(product.getAmount() - request.getQuantity());
        return productMapper.toProductResponse(productRepository.save(product));
    }
}