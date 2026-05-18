package com.gateway_service.controller;

import com.gateway_service.client.ProductClient;
import com.gateway_service.dto.product.InventoryUpdateRequest;
import com.gateway_service.dto.product.ProductCreationRequest;
import com.gateway_service.dto.product.ProductResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import jakarta.annotation.security.RolesAllowed;
import jakarta.annotation.security.PermitAll;

import java.util.List;

@Path("/esb/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class EsbProductController {

    private final ProductClient productClient;

    @POST
    @RolesAllowed("ADMIN")
    public ProductResponse createProduct(
            ProductCreationRequest request,
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return productClient.createProduct(request, token);
    }

    @GET
    @PermitAll
    public List<ProductResponse> listProducts() {
        return productClient.getAllProducts();
    }

    @GET
    @Path("/category/{categoryName}")
    @PermitAll
    public List<ProductResponse> getByCategory(@PathParam("categoryName") String categoryName) {
        return productClient.getProductsByCategory(categoryName);
    }

    @GET
    @Path("/name/{name}")
    @PermitAll
    public ProductResponse getByName(@PathParam("name") String name) {
        return productClient.getProductByName(name);
    }

    @POST
    @Path("/{productId}/inventory/decrease")
    @PermitAll
    public ProductResponse decrementInventory(
            @PathParam("productId") String productId,
            InventoryUpdateRequest request,
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return productClient.decrementInventory(productId, request, token);
    }

    @POST
    @Path("/{productId}/inventory/increase")
    @PermitAll
    public ProductResponse incrementInventory(
            @PathParam("productId") String productId,
            InventoryUpdateRequest request,
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return productClient.incrementInventory(productId, request, token);
    }

    @POST
    @Path("/inventory/reset")
    @RolesAllowed("ADMIN")
    public List<ProductResponse> resetAllInventory(
            InventoryUpdateRequest request,
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        Integer quantity = request != null ? request.getQuantity() : null;
        return productClient.resetAllInventory(quantity, token);
    }

    @GET
    @Path("/categories")
    @PermitAll
    public List<String> getAllCategories() {
        return productClient.getAllCategories();
    }

    @PUT
    @Path("/{productId}")
    @RolesAllowed("ADMIN")
    public ProductResponse updateProduct(
            @PathParam("productId") String productId,
            ProductCreationRequest request,
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return productClient.updateProduct(productId, request, token);
    }

    @DELETE
    @Path("/{productId}")
    @RolesAllowed("ADMIN")
    public Response deleteProduct(
            @PathParam("productId") String productId,
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        productClient.deleteProduct(productId, token);
        return Response.noContent().build();
    }

    @POST
    @Path("/import/highlands")
    @RolesAllowed("ADMIN")
    public List<ProductResponse> importHighlands(
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return productClient.importHighlands(token);
    }
}