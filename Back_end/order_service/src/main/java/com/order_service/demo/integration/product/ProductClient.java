package com.order_service.demo.integration.product;

import com.order_service.demo.common.ApiResponse;
import com.order_service.demo.common.exception.AppException;
import com.order_service.demo.common.exception.ErrorCode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import jakarta.ws.rs.WebApplicationException;

@Slf4j
@ApplicationScoped
public class ProductClient {

    @Inject
    @RestClient
    ProductRestClient productRestClient;

    public ProductSummary fetchProductByName(String productName) {
        try {
            ApiResponse<ProductSummary> response = productRestClient.fetchProductByName(productName);
            if (response == null || response.getResult() == null) {
                throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
            }
            return response.getResult();
        } catch (WebApplicationException ex) {
            String errorBody = ex.getResponse().readEntity(String.class);
            log.error("Product service error fetching {}: {}", productName, errorBody);
            if (errorBody != null && (errorBody.contains("1007") || ex.getResponse().getStatus() == 404)) {
                throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
            }
            throw new AppException(ErrorCode.PRODUCT_SERVICE_UNAVAILABLE);
        } catch (Exception ex) {
            log.error("Connection error fetching product {}", productName, ex);
            throw new AppException(ErrorCode.PRODUCT_SERVICE_UNAVAILABLE);
        }
    }

    public void decreaseInventory(String productId, int quantity) {
        try {
            productRestClient.decreaseInventory(productId, new InventoryUpdateRequest(quantity));
        } catch (WebApplicationException ex) {
            String errorBody = ex.getResponse().readEntity(String.class);
            log.error("Failed to decrease inventory: {}", errorBody);
            if (errorBody != null) {
                if (errorBody.contains("1008")) {
                    throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK);
                }
                if (errorBody.contains("1007")) {
                    throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
                }
            }
            throw new AppException(ErrorCode.PRODUCT_SERVICE_UNAVAILABLE);
        } catch (Exception ex) {
            log.error("Service unavailable when updating inventory for {}", productId, ex);
            throw new AppException(ErrorCode.PRODUCT_SERVICE_UNAVAILABLE);
        }
    }

    public void increaseInventory(String productId, int quantity) {
        try {
            productRestClient.increaseInventory(productId, new InventoryUpdateRequest(quantity));
        } catch (WebApplicationException ex) {
            String errorBody = ex.getResponse().readEntity(String.class);
            log.error("Failed to increase inventory: {}", errorBody);
            if (errorBody != null && errorBody.contains("1007")) {
                throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
            }
            throw new AppException(ErrorCode.PRODUCT_SERVICE_UNAVAILABLE);
        } catch (Exception ex) {
            log.error("Service unavailable when updating inventory for {}", productId, ex);
            throw new AppException(ErrorCode.PRODUCT_SERVICE_UNAVAILABLE);
        }
    }
}