package com.example.demo_database.feature.order.controller;

import com.example.demo_database.common.ApiResponse;
import com.example.demo_database.feature.order.dto.request.OrderCreationRequest;
import com.example.demo_database.feature.order.dto.response.OrderResponse;
import com.example.demo_database.feature.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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
}