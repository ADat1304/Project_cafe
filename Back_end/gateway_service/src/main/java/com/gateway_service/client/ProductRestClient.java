package com.gateway_service.client;

import com.gateway_service.common.ApiResponse;
import com.gateway_service.dto.product.InventoryUpdateRequest;
import com.gateway_service.dto.product.ProductCreationRequest;
import com.gateway_service.dto.product.ProductResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import java.util.List;

@RegisterRestClient(configKey = "product-client")
@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface ProductRestClient {

    @POST
    ApiResponse<ProductResponse> createProduct(ProductCreationRequest request, @HeaderParam("Authorization") String token);

    @GET
    ApiResponse<List<ProductResponse>> getAllProducts();

    @GET
    @Path("/name/{name}")
    ApiResponse<ProductResponse> getProductByName(@PathParam("name") String name);

    @POST
    @Path("/{productId}/inventory/decrease")
    ApiResponse<ProductResponse> decrementInventory(@PathParam("productId") String productId, InventoryUpdateRequest request, @HeaderParam("Authorization") String token);

    @POST
    @Path("/{productId}/inventory/increase")
    ApiResponse<ProductResponse> incrementInventory(@PathParam("productId") String productId, InventoryUpdateRequest request, @HeaderParam("Authorization") String token);

    @GET
    @Path("/category/{categoryName}")
    ApiResponse<List<ProductResponse>> getProductsByCategory(@PathParam("categoryName") String categoryName);

    @GET
    @Path("/categories")
    ApiResponse<List<String>> getAllCategories();

    @PUT
    @Path("/{productId}")
    ApiResponse<ProductResponse> updateProduct(@PathParam("productId") String productId, ProductCreationRequest request, @HeaderParam("Authorization") String token);

    @DELETE
    @Path("/{productId}")
    void deleteProduct(@PathParam("productId") String productId, @HeaderParam("Authorization") String token);

    @POST
    @Path("/inventory/reset")
    ApiResponse<List<ProductResponse>> resetAllInventory(InventoryUpdateRequest request, @HeaderParam("Authorization") String token);

    @POST
    @Path("/import/highlands")
    ApiResponse<List<ProductResponse>> importHighlands(@HeaderParam("Authorization") String token);
}
