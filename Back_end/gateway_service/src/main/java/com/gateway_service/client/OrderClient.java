package com.gateway_service.client;

import com.gateway_service.common.ApiResponse;
import com.gateway_service.dto.order.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import java.math.BigDecimal;
import java.util.List;

@ApplicationScoped
public class OrderClient {

    @Inject
    @RestClient
    OrderRestClient orderRestClient;

    public OrderResponse createOrder(OrderCreationRequest request, String token) {
        ApiResponse<OrderResponse> response = orderRestClient.createOrder(request, formatToken(token));
        return response != null ? response.getResult() : null;
    }

    public List<OrderResponse> getAllOrders(String token) {
        ApiResponse<List<OrderResponse>> response = orderRestClient.getAllOrders(formatToken(token));
        return response != null ? response.getResult() : List.of();
    }

    public OrderResponse addItem(String orderId, OrderItemRequest request, String token) {
        ApiResponse<OrderResponse> response = orderRestClient.addItem(orderId, request, formatToken(token));
        return response != null ? response.getResult() : null;
    }

    public OrderResponse decreaseItem(String orderId, OrderItemRequest request, String token) {
        ApiResponse<OrderResponse> response = orderRestClient.decreaseItem(orderId, request, formatToken(token));
        return response != null ? response.getResult() : null;
    }

    public OrderResponse updateStatus(String orderId, OrderStatusUpdateRequest request, String token) {
        ApiResponse<OrderResponse> response = orderRestClient.updateStatus(orderId, request, formatToken(token));
        return response != null ? response.getResult() : null;
    }

    public DailyOrderStatsResponse getDailyStats(String date, String token) {
        ApiResponse<DailyOrderStatsResponse> response = orderRestClient.getDailyStats(date, formatToken(token));
        return response != null ? response.getResult() : null;
    }

    public List<Object> getPaymentMethods(String token) {
        ApiResponse<List<Object>> response = orderRestClient.getPaymentMethods(formatToken(token));
        return response != null ? response.getResult() : List.of();
    }

    public List<TopProductResponse> getTopSelling(int limit, String token) {
        ApiResponse<List<TopProductResponse>> response = orderRestClient.getTopSelling(limit, formatToken(token));
        return response != null ? response.getResult() : List.of();
    }

    public BigDecimal getRevenue(String startDate, String endDate, String token) {
        ApiResponse<BigDecimal> response = orderRestClient.getRevenue(startDate, endDate, formatToken(token));
        return response != null ? response.getResult() : BigDecimal.ZERO;
    }

    private String formatToken(String token) {
        if (token != null && !token.isBlank()) {
            if (token.startsWith("Bearer ") || token.startsWith("bearer ")) {
                return token;
            }
            return "Bearer " + token;
        }
        return null;
    }
}
