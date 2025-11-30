package com.gateway_service.client;


import com.gateway_service.common.ApiResponse;
import com.gateway_service.config.ServiceEndpointsProperties;
import com.gateway_service.dto.product.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductClient {

    private final RestTemplate restTemplate;
    private final ServiceEndpointsProperties endpointsProperties;

    public List<ProductResponse> getAllProducts() {
        ResponseEntity<ApiResponse<List<ProductResponse>>> response = restTemplate.exchange(
                endpointsProperties.getProduct() + "/products",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {
                }
        );
        return response.getBody() != null ? response.getBody().getResult() : List.of();
    }

    public ProductResponse getProductByName(String name) {
        ResponseEntity<ApiResponse<ProductResponse>> response = restTemplate.exchange(
                endpointsProperties.getProduct() + "/products/name/" + name,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {
                }
        );
        return response.getBody() != null ? response.getBody().getResult() : null;
    }
}
