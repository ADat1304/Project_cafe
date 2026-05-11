package com.gateway_service.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(baseUri = "http://localhost:8082")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface ProductClient {

    @GET
    @Path("/products")
    Object getAllProducts();

    @GET
    @Path("/products/categories")
    Object getCategories();

    @GET
    @Path("/products/{id}")
    Object getProductById(@PathParam("id") String id);

    @POST
    @Path("/products")
    Object createProduct(Object product);

    @PUT
    @Path("/products/{id}")
    Object updateProduct(@PathParam("id") String id, Object product);

    @DELETE
    @Path("/products/{id}")
    Object deleteProduct(@PathParam("id") String id);
}
