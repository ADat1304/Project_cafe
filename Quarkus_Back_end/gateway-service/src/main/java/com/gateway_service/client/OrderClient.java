package com.gateway_service.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(baseUri = "http://localhost:8083")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface OrderClient {

    @POST
    @Path("/orders")
    Object createOrder(Object order);

    @GET
    @Path("/orders")
    Object getAllOrders();

    @GET
    @Path("/orders/daily-stats")
    Object getDailyStats(@QueryParam("date") String date);

    @PATCH
    @Path("/orders/{id}/status")
    Object updateStatus(@PathParam("id") String id, Object status);
}
