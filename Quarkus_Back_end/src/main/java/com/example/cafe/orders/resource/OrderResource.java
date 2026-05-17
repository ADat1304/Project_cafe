package com.example.cafe.orders.resource;

import com.example.cafe.common.ApiResponse;
import com.example.cafe.orders.dto.request.OrderCreationRequest;
import com.example.cafe.orders.dto.request.OrderItemRequest;
import com.example.cafe.orders.dto.request.OrderStatusUpdateRequest;
import com.example.cafe.orders.dto.response.DailyOrderStatsResponse;
import com.example.cafe.orders.dto.response.OrderResponse;
import com.example.cafe.orders.dto.response.TopProductResponse;
import com.example.cafe.orders.entity.PaymentMethod;
import com.example.cafe.orders.service.OrderService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Path("/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OrderResource {

    @Inject
    OrderService orderService;

    @POST
    public Response createOrder(@Valid OrderCreationRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.<OrderResponse>builder()
                        .result(response)
                        .build())
                .build();
    }

    @PATCH
    @Path("/{orderId}/status")
    public ApiResponse<OrderResponse> updateStatus(@PathParam("orderId") String orderId,
                                                   @Valid OrderStatusUpdateRequest request) {
        OrderResponse response = orderService.updateStatus(orderId, request);
        return ApiResponse.<OrderResponse>builder()
                .result(response)
                .build();
    }

    @GET
    public ApiResponse<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orders)
                .build();
    }

    @GET
    @Path("/daily-stats")
    public ApiResponse<DailyOrderStatsResponse> getDailyStats(@QueryParam("date") String dateStr) {
        LocalDate date = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();
        DailyOrderStatsResponse stats = orderService.getDailyStats(date);
        return ApiResponse.<DailyOrderStatsResponse>builder()
                .result(stats)
                .build();
    }

    @GET
    @Path("/payment-methods")
    public ApiResponse<List<PaymentMethod>> getPaymentMethods() {
        return ApiResponse.<List<PaymentMethod>>builder()
                .result(orderService.getAllPaymentMethods())
                .build();
    }

    @GET
    @Path("/top-selling")
    public ApiResponse<List<TopProductResponse>> getTopSelling(@QueryParam("limit") @DefaultValue("5") int limit) {
        return ApiResponse.<List<TopProductResponse>>builder()
                .result(orderService.getTopSellingProducts(limit))
                .build();
    }

    @GET
    @Path("/revenue")
    public ApiResponse<BigDecimal> getRevenue(@QueryParam("startDate") String startDateStr,
                                              @QueryParam("endDate") String endDateStr) {
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);
        return ApiResponse.<BigDecimal>builder()
                .result(orderService.getRevenueBetween(startDate, endDate, "CLOSE"))
                .build();
    }

    @POST
    @Path("/{orderId}/items")
    public ApiResponse<OrderResponse> addItem(@PathParam("orderId") String orderId,
                                              @Valid OrderItemRequest request) {
        OrderResponse response = orderService.addItem(orderId, request);
        return ApiResponse.<OrderResponse>builder()
                .result(response)
                .build();
    }

    @POST
    @Path("/{orderId}/items/decrease")
    public ApiResponse<OrderResponse> decreaseItem(@PathParam("orderId") String orderId,
                                                   @Valid OrderItemRequest request) {
        OrderResponse response = orderService.decreaseItemQuantity(orderId, request);
        return ApiResponse.<OrderResponse>builder()
                .result(response)
                .build();
    }
}
