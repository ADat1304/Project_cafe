package com.gateway_service.resource;

import com.gateway_service.client.ProductClient;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@Path("/esb/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EsbProductResource {

    @Inject
    @RestClient
    ProductClient productClient;

    @GET
    public Object getAllProducts() {
        return productClient.getAllProducts();
    }

    @GET
    @Path("/categories")
    public Object getCategories() {
        return productClient.getCategories();
    }

    @GET
    @Path("/{id}")
    public Object getProductById(@PathParam("id") String id) {
        return productClient.getProductById(id);
    }

    @POST
    public Object createProduct(Object product) {
        return productClient.createProduct(product);
    }

    @PUT
    @Path("/{id}")
    public Object updateProduct(@PathParam("id") String id, Object product) {
        return productClient.updateProduct(id, product);
    }

    @DELETE
    @Path("/{id}")
    public Object deleteProduct(@PathParam("id") String id) {
        return productClient.deleteProduct(id);
    }
}
