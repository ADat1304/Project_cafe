package com.gateway_service.controller;

import com.gateway_service.client.OrderClient;
import com.gateway_service.dto.esb.OrchestratedOrderResponse;
import com.gateway_service.dto.order.*;
import com.gateway_service.service.OrderOrchestrationService;
import lombok.RequiredArgsConstructor;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.PermitAll;

import java.math.BigDecimal;
import java.util.List;

@Path("/esb/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
@Authenticated
public class EsbOrderController {

    private final OrderOrchestrationService orchestrationService;
    private final OrderClient orderClient;

    @POST
    public OrchestratedOrderResponse createOrder(
            @HeaderParam("Authorization") String authorization,
            OrderCreationRequest request
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return orchestrationService.orchestrateOrder(token, request);
    }

    @GET
    public List<OrderResponse> listOrders(
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return orderClient.getAllOrders(token);
    }

    @PATCH
    @Path("/{orderId}/status")
    public OrderResponse updateStatus(
            @PathParam("orderId") String orderId,
            @HeaderParam("Authorization") String authorization,
            OrderStatusUpdateRequest request
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return orderClient.updateStatus(orderId, request, token);
    }

    @GET
    @Path("/daily-stats")
    public DailyOrderStatsResponse getDailyStats(
            @HeaderParam("Authorization") String authorization,
            @QueryParam("date") String date
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return orderClient.getDailyStats(date, token);
    }

    @GET
    @Path("/payment-methods")
    public List<Object> getPaymentMethods(
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return orderClient.getPaymentMethods(token);
    }

    @GET
    @Path("/top-selling")
    @PermitAll
    public List<TopProductResponse> getTopSelling(
            @HeaderParam("Authorization") String authorization,
            @QueryParam("limit") @DefaultValue("5") int limit
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return orderClient.getTopSelling(limit, token);
    }

    @GET
    @Path("/revenue")
    @PermitAll
    public BigDecimal getRevenue(
            @HeaderParam("Authorization") String authorization,
            @QueryParam("startDate") String startDate,
            @QueryParam("endDate") String endDate
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return orderClient.getRevenue(startDate, endDate, token);
    }

    @POST
    @Path("/{orderId}/items")
    public OrderResponse addItem(
            @PathParam("orderId") String orderId,
            @HeaderParam("Authorization") String authorization,
            OrderItemRequest request
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return orderClient.addItem(orderId, request, token);
    }

    @POST
    @Path("/{orderId}/items/decrease")
    public OrderResponse decreaseItem(
            @PathParam("orderId") String orderId,
            @HeaderParam("Authorization") String authorization,
            OrderItemRequest request
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return orderClient.decreaseItem(orderId, request, token);
    }
}
