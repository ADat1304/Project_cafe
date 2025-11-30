package com.gateway_service.client;


import com.gateway_service.common.ApiResponse;
import com.gateway_service.config.ServiceEndpointsProperties;
import com.gateway_service.dto.order.OrderCreationRequest;
import com.gateway_service.dto.order.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderClient {

    private final RestTemplate restTemplate;
    private final ServiceEndpointsProperties endpointsProperties;

    public OrderResponse createOrder(OrderCreationRequest request, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (token != null && !token.isBlank()) {
            headers.setBearerAuth(token);
        }
        HttpEntity<OrderCreationRequest> entity = new HttpEntity<>(request, headers);
        ResponseEntity<ApiResponse<OrderResponse>> response = restTemplate.exchange(
                endpointsProperties.getOrder() + "/orders",
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );
        return response.getBody() != null ? response.getBody().getResult() : null;
    }

    public List<OrderResponse> getAllOrders(String token) {
        HttpHeaders headers = new HttpHeaders();
        if (token != null && !token.isBlank()) {
            headers.setBearerAuth(token);
        }
        ResponseEntity<ApiResponse<List<OrderResponse>>> response = restTemplate.exchange(
                endpointsProperties.getOrder() + "/orders",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<>() {
                }
        );
        return response.getBody() != null ? response.getBody().getResult() : List.of();
    }
}
