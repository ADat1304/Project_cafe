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
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@ApplicationScoped
public class ProductService {

    @Inject
    ProductRepository productRepository;
    
    @Inject
    ProductMapper productMapper;
    
    @Inject
    CategoryRepository categoryRepository;

    @Transactional
    public ProductResponse createProduct(ProductCreationRequest request) {
        if (productRepository.existsByProductName(request.getProductName()))
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
        productRepository.persist(product);
        return productMapper.toProductResponse(product);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.listAll()
                .stream()
                .map(productMapper::toProductResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductByName(String productName) {
        Product product = productRepository.findByProductName(productName)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return productMapper.toProductResponse(product);
    }

    @Transactional
    public ProductResponse decrementInventory(String productId, InventoryUpdateRequest request) {
        Product product = productRepository.findByIdOptional(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (product.getAmount() < request.getQuantity()) {
            throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK);
        }

        product.setAmount(product.getAmount() - request.getQuantity());
        return productMapper.toProductResponse(product);
    }

    @Transactional
    public ProductResponse incrementInventory(String productId, InventoryUpdateRequest request) {
        Product product = productRepository.findByIdOptional(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        product.setAmount(product.getAmount() + request.getQuantity());
        return productMapper.toProductResponse(product);
    }

    public List<ProductResponse> getProductsByCategory(String categoryName) {
        if (Objects.isNull(categoryName) || categoryName.isBlank() || categoryName.equalsIgnoreCase("all")) {
            return getAllProducts();
        }

        return productRepository.find("category.categoryName", categoryName)
                .stream()
                .map(productMapper::toProductResponse)
                .collect(Collectors.toList());
    }

    public List<String> getAllCategoryNames() {
        return categoryRepository.listAll().stream()
                .map(Category::getCategoryName)
                .distinct()
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ProductResponse> resetAllInventoryTo(int quantity) {
        if (quantity < 0) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        List<Product> products = productRepository.listAll();
        products.forEach(product -> product.setAmount(quantity));
        return products.stream()
                .map(productMapper::toProductResponse)
                .collect(Collectors.toList());
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void resetInventoryDaily() {
        resetAllInventoryTo(100);
    }

    @Transactional
    public ProductResponse updateProduct(String productId, ProductCreationRequest request) {
        Product product = productRepository.findByIdOptional(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        product.setProductName(request.getProductName());
        product.setPrice(request.getPrice());
        product.setAmount(request.getAmount());

        Category category = categoryRepository.findByCategoryName(request.getCategoryName())
                .orElseThrow(() -> new RuntimeException("Category not found: " + request.getCategoryName()));
        product.setCategory(category);

        if (Objects.nonNull(request.getImages())) {
            product.getImages().clear();
            List<Image> newImages = request.getImages().stream()
                    .map(link -> Image.builder().imageLink(link).product(product).build())
                    .collect(Collectors.toList());
            product.getImages().addAll(newImages);
        }

        return productMapper.toProductResponse(product);
    }

    @Transactional
    public void deleteProduct(String productId) {
        if (!productRepository.deleteById(productId)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
    }
}
