package com.gateway_service.controller;

import com.gateway_service.client.OrderClient;
import com.gateway_service.dto.esb.OrchestratedOrderResponse;
import com.gateway_service.dto.order.OrderCreationRequest;
import com.gateway_service.dto.order.OrderResponse;
import com.gateway_service.dto.order.OrderStatusUpdateRequest;
import com.gateway_service.service.OrderOrchestrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/esb/orders")
@RequiredArgsConstructor
public class EsbOrderController {

    private final OrderOrchestrationService orchestrationService;
    private final OrderClient orderClient;

    @PostMapping
    public ResponseEntity<OrchestratedOrderResponse> createOrder(
            @RequestHeader(name = "Authorization") String authorization,
            @RequestBody OrderCreationRequest request
    ) {
        String token = authorization.replace("Bearer ", "");
        OrchestratedOrderResponse response = orchestrationService.orchestrateOrder(token, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> listOrders(
            @RequestHeader(name = "Authorization") String authorization
    ) {
        String token = authorization.replace("Bearer ", "");
        return ResponseEntity.ok(orderClient.getAllOrders(token));
    }
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable String orderId,
            @RequestHeader(name = "Authorization") String authorization,
            @RequestBody OrderStatusUpdateRequest request
    ) {
        String token = authorization.replace("Bearer ", "");
        return ResponseEntity.ok(orderClient.updateStatus(orderId, request, token));
    }
}
