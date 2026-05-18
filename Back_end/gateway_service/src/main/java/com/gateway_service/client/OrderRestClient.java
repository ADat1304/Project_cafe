package com.gateway_service.client;

import com.gateway_service.common.ApiResponse;
import com.gateway_service.dto.order.*;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import java.math.BigDecimal;
import java.util.List;

@RegisterRestClient(configKey = "order-client")
@Path("/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface OrderRestClient {

    @POST
    ApiResponse<OrderResponse> createOrder(OrderCreationRequest request, @HeaderParam("Authorization") String token);

    @GET
    ApiResponse<List<OrderResponse>> getAllOrders(@HeaderParam("Authorization") String token);

    @POST
    @Path("/{orderId}/items")
    ApiResponse<OrderResponse> addItem(@PathParam("orderId") String orderId, OrderItemRequest request, @HeaderParam("Authorization") String token);

    @POST
    @Path("/{orderId}/items/decrease")
    ApiResponse<OrderResponse> decreaseItem(@PathParam("orderId") String orderId, OrderItemRequest request, @HeaderParam("Authorization") String token);

    @PATCH
    @Path("/{orderId}/status")
    ApiResponse<OrderResponse> updateStatus(@PathParam("orderId") String orderId, OrderStatusUpdateRequest request, @HeaderParam("Authorization") String token);

    @GET
    @Path("/daily-stats")
    ApiResponse<DailyOrderStatsResponse> getDailyStats(@QueryParam("date") String date, @HeaderParam("Authorization") String token);

    @GET
    @Path("/payment-methods")
    ApiResponse<List<Object>> getPaymentMethods(@HeaderParam("Authorization") String token);

    @GET
    @Path("/top-selling")
    ApiResponse<List<TopProductResponse>> getTopSelling(@QueryParam("limit") int limit, @HeaderParam("Authorization:Bearer ") String token);

    @GET
    @Path("/revenue")
    ApiResponse<BigDecimal> getRevenue(@QueryParam("startDate") String startDate, @QueryParam("endDate") String endDate, @HeaderParam("Authorization") String token);
}
