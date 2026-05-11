package com.example.order_service.client;

import com.example.order_service.dto.response.ProductResponse;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "product-client")
public interface ProductClient {

    @GET
    @Path("/products/name/{productName}")
    ProductResponse getProductByName(@PathParam("productName") String productName);
}
