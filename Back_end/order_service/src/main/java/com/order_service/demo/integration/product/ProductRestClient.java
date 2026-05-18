package com.order_service.demo.integration.product;

import com.order_service.demo.common.ApiResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "product-client")
@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface ProductRestClient {

    @GET
    @Path("/name/{name}")
    ApiResponse<ProductSummary> fetchProductByName(@PathParam("name") String name);

    @POST
    @Path("/{id}/inventory/decrease")
    ApiResponse<ProductSummary> decreaseInventory(@PathParam("id") String id, InventoryUpdateRequest request);

    @POST
    @Path("/{id}/inventory/increase")
    ApiResponse<ProductSummary> increaseInventory(@PathParam("id") String id, InventoryUpdateRequest request);
}
