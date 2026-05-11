package com.gateway_service.resource;

import com.gateway_service.client.OrderClient;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@Path("/esb/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EsbOrderResource {

    @Inject
    @RestClient
    OrderClient orderClient;

    @POST
    public Object createOrder(Object order) {
        return orderClient.createOrder(order);
    }

    @GET
    public Object getAllOrders() {
        return orderClient.getAllOrders();
    }

    @GET
    @Path("/daily-stats")
    public Object getDailyStats(@QueryParam("date") String date) {
        return orderClient.getDailyStats(date);
    }

    @PATCH
    @Path("/{id}/status")
    public Object updateStatus(@PathParam("id") String id, Object status) {
        return orderClient.updateStatus(id, status);
    }
}
