package com.order_service.demo.controller;

import com.order_service.demo.common.ApiResponse;
import com.order_service.demo.dto.request.OrderCreationRequest;
import com.order_service.demo.dto.request.OrderStatusUpdateRequest;
import com.order_service.demo.dto.response.DailyOrderStatsResponse;
import com.order_service.demo.dto.response.OrderResponse;
import com.order_service.demo.service.OrderService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {

    OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrderResponse> createOrder(@Valid @RequestBody OrderCreationRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ApiResponse.<OrderResponse>builder()
                .result(response)
                .build();
    }
    @PatchMapping("/{orderId}/status")
    public ApiResponse<OrderResponse> updateStatus(@PathVariable String orderId,
                                                   @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderResponse response = orderService.updateStatus(orderId, request);
        return ApiResponse.<OrderResponse>builder()
                .result(response)
                .build();
    }
    @GetMapping
    public ApiResponse<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orders)
                .build();
    }
    @GetMapping("/daily-stats")
    public ApiResponse<DailyOrderStatsResponse> getDailyStats(
            @RequestParam(value = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DailyOrderStatsResponse stats = orderService.getDailyStats(date);
        return ApiResponse.<DailyOrderStatsResponse>builder()
                .result(stats)
                .build();
    }
}