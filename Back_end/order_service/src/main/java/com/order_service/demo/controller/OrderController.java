package com.order_service.demo.controller;

import com.order_service.demo.common.ApiResponse;
import com.order_service.demo.dto.request.OrderCreationRequest;
import com.order_service.demo.dto.request.OrderStatusUpdateRequest;
import com.order_service.demo.dto.response.DailyOrderStatsResponse;
import com.order_service.demo.dto.response.OrderResponse;
import com.order_service.demo.dto.response.TopProductResponse;
import com.order_service.demo.entity.PaymentMethod;
import com.order_service.demo.service.OrderService;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.order_service.demo.dto.request.OrderItemRequest;

@Path("/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {

    OrderService orderService;

    @POST
    public ApiResponse<OrderResponse> createOrder(@Valid OrderCreationRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ApiResponse.<OrderResponse>builder()
                .result(response)
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
    public ApiResponse<DailyOrderStatsResponse> getDailyStats(@QueryParam("date") LocalDate date) {
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
    public ApiResponse<BigDecimal> getRevenue(
            @QueryParam("startDate") LocalDate startDate,
            @QueryParam("endDate") LocalDate endDate) {
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