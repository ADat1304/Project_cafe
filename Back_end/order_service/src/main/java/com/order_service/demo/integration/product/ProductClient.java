package com.order_service.demo.integration.product;



import com.order_service.demo.common.ApiResponse;
import com.order_service.demo.common.exception.AppException;
import com.order_service.demo.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductClient {

    private final RestTemplate restTemplate;

    @Value("${services.product.url:http://localhost:8082}")
    private String productServiceUrl;

    public ProductSummary fetchProductByName(String productName) {
        String url = UriComponentsBuilder.fromHttpUrl(productServiceUrl)
                .path("/products/name/")
                .pathSegment(encode(productName))
                .toUriString();
        try {
            ResponseEntity<ApiResponse<ProductSummary>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiResponse<ProductSummary>>() {}
            );
            ProductSummary product = Objects.requireNonNull(response.getBody()).getResult();
            if (Objects.isNull(product)) {
                throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
            }
            return product;
        } catch (HttpClientErrorException.NotFound ex) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        } catch (RestClientException ex) {
            log.error("Failed to fetch product {}", productName, ex);
            throw new AppException(ErrorCode.PRODUCT_SERVICE_UNAVAILABLE);
        }
    }

    public void decreaseInventory(String productId, int quantity) {
        String url = UriComponentsBuilder.fromHttpUrl(productServiceUrl)
                .path("/products/")
                .pathSegment(productId)
                .path("/inventory/decrease")
                .toUriString();
        try {
            HttpEntity<InventoryUpdateRequest> request = new HttpEntity<>(new InventoryUpdateRequest(quantity));
            restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    new ParameterizedTypeReference<ApiResponse<ProductSummary>>() {}
            );
        } catch (HttpClientErrorException.NotFound ex) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        } catch (RestClientException ex) {
            log.error("Failed to update inventory for product {}", productId, ex);
            throw new AppException(ErrorCode.PRODUCT_SERVICE_UNAVAILABLE);
        }
    }
    public void increaseInventory(String productId, int quantity) {
        String url = UriComponentsBuilder.fromHttpUrl(productServiceUrl)
                .path("/products/")
                .pathSegment(productId)
                .path("/inventory/increase")
                .toUriString();
        try {
            HttpEntity<InventoryUpdateRequest> request = new HttpEntity<>(new InventoryUpdateRequest(quantity));
            restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    new ParameterizedTypeReference<ApiResponse<ProductSummary>>() {}
            );
        } catch (HttpClientErrorException.NotFound ex) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        } catch (RestClientException ex) {
            log.error("Failed to update inventory for product {}", productId, ex);
            throw new AppException(ErrorCode.PRODUCT_SERVICE_UNAVAILABLE);
        }
    }

    private String encode(String value) {
        return UriUtils.encodePathSegment(value, StandardCharsets.UTF_8);
    }
}
