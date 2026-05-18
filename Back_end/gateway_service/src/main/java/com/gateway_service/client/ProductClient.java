package com.gateway_service.client;

import com.gateway_service.common.ApiResponse;
import com.gateway_service.dto.product.InventoryUpdateRequest;
import com.gateway_service.dto.product.ProductCreationRequest;
import com.gateway_service.dto.product.ProductResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import java.util.List;

@ApplicationScoped
public class ProductClient {

    @Inject
    @RestClient
    ProductRestClient productRestClient;

    public ProductResponse createProduct(ProductCreationRequest request, String token) {
        ApiResponse<ProductResponse> response = productRestClient.createProduct(request, formatToken(token));
        return response != null ? response.getResult() : null;
    }

    public List<ProductResponse> getAllProducts() {
        ApiResponse<List<ProductResponse>> response = productRestClient.getAllProducts();
        return response != null ? response.getResult() : List.of();
    }

    public ProductResponse getProductByName(String name) {
        ApiResponse<ProductResponse> response = productRestClient.getProductByName(name);
        return response != null ? response.getResult() : null;
    }

    public ProductResponse decrementInventory(String productId, InventoryUpdateRequest request, String token) {
        ApiResponse<ProductResponse> response = productRestClient.decrementInventory(productId, request, formatToken(token));
        return response != null ? response.getResult() : null;
    }

    public ProductResponse incrementInventory(String productId, InventoryUpdateRequest request, String token) {
        ApiResponse<ProductResponse> response = productRestClient.incrementInventory(productId, request, formatToken(token));
        return response != null ? response.getResult() : null;
    }

    public List<ProductResponse> getProductsByCategory(String categoryName) {
        ApiResponse<List<ProductResponse>> response = productRestClient.getProductsByCategory(categoryName);
        return response != null ? response.getResult() : List.of();
    }

    public List<String> getAllCategories() {
        ApiResponse<List<String>> response = productRestClient.getAllCategories();
        return response != null ? response.getResult() : List.of();
    }

    public ProductResponse updateProduct(String productId, ProductCreationRequest request, String token) {
        ApiResponse<ProductResponse> response = productRestClient.updateProduct(productId, request, formatToken(token));
        return response != null ? response.getResult() : null;
    }

    public void deleteProduct(String productId, String token) {
        productRestClient.deleteProduct(productId, formatToken(token));
    }

    public List<ProductResponse> resetAllInventory(Integer quantity, String token) {
        InventoryUpdateRequest payload = InventoryUpdateRequest.builder()
                .quantity(quantity != null ? quantity : 100)
                .build();
        ApiResponse<List<ProductResponse>> response = productRestClient.resetAllInventory(payload, formatToken(token));
        return response != null ? response.getResult() : List.of();
    }

    public List<ProductResponse> importHighlands(String token) {
        ApiResponse<List<ProductResponse>> response = productRestClient.importHighlands(formatToken(token));
        return response != null ? response.getResult() : List.of();
    }

    private String formatToken(String token) {
        if (token != null && !token.isBlank()) {
            if (token.startsWith("Bearer ") || token.startsWith("bearer ")) {
                return token;
            }
            return "Bearer " + token;
        }
        return null;
    }
}