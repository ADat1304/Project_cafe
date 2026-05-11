package com.example.product_service.resource;

import com.example.product_service.common.ApiResponse;
import com.example.product_service.dto.request.InventoryUpdateRequest;
import com.example.product_service.dto.request.ProductCreationRequest;
import com.example.product_service.dto.response.ProductResponse;
import com.example.product_service.service.ProductService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Objects;

@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductResource {

    @Inject
    ProductService productService;

    @POST
    @RolesAllowed("ADMIN")
    public ApiResponse<ProductResponse> createProduct(@Valid ProductCreationRequest request) {
        ProductResponse productResponse = productService.createProduct(request);
        return ApiResponse.<ProductResponse>builder()
                .result(productResponse)
                .build();
    }

    @GET
    @Path("/category/{categoryName}")
    public ApiResponse<List<ProductResponse>> getByCategory(@PathParam("categoryName") String categoryName) {
        List<ProductResponse> products = productService.getProductsByCategory(categoryName);
        return ApiResponse.<List<ProductResponse>>builder()
                .result(products)
                .build();
    }

    @GET
    public ApiResponse<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ApiResponse.<List<ProductResponse>>builder()
                .result(products)
                .build();
    }

    @GET
    @Path("/name/{productName}")
    public ApiResponse<ProductResponse> getByName(@PathParam("productName") String productName) {
        ProductResponse product = productService.getProductByName(productName);
        return ApiResponse.<ProductResponse>builder()
                .result(product)
                .build();
    }

    @POST
    @Path("/{productId}/inventory/decrease")
    public ApiResponse<ProductResponse> decrementInventory(@PathParam("productId") String productId, @Valid InventoryUpdateRequest request) {
        ProductResponse product = productService.decrementInventory(productId, request);
        return ApiResponse.<ProductResponse>builder()
                .result(product)
                .build();
    }

    @POST
    @Path("/{productId}/inventory/increase")
    public ApiResponse<ProductResponse> incrementInventory(@PathParam("productId") String productId, @Valid InventoryUpdateRequest request) {
        ProductResponse product = productService.incrementInventory(productId, request);
        return ApiResponse.<ProductResponse>builder()
                .result(product)
                .build();
    }

    @POST
    @Path("/inventory/reset")
    public ApiResponse<List<ProductResponse>> resetInventory(InventoryUpdateRequest request) {
        int quantity = Objects.nonNull(request) ? request.getQuantity() : 100;
        return ApiResponse.<List<ProductResponse>>builder()
                .result(productService.resetAllInventoryTo(quantity))
                .build();
    }

    @GET
    @Path("/categories")
    public ApiResponse<List<String>> getAllCategories() {
        return ApiResponse.<List<String>>builder()
                .result(productService.getAllCategoryNames())
                .build();
    }

    @PUT
    @Path("/{productId}")
    @RolesAllowed("ADMIN")
    public ApiResponse<ProductResponse> updateProduct(@PathParam("productId") String productId, @Valid ProductCreationRequest request) {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.updateProduct(productId, request))
                .build();
    }

    @DELETE
    @Path("/{productId}")
    @RolesAllowed("ADMIN")
    public ApiResponse<String> deleteProduct(@PathParam("productId") String productId) {
        productService.deleteProduct(productId);
        return ApiResponse.<String>builder()
                .result("Product has been deleted")
                .build();
    }
}
