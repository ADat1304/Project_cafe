package com.gateway_service.client;

import com.gateway_service.common.ApiResponse;
import com.gateway_service.dto.table.CafeTableResponse;
import com.gateway_service.dto.table.TableStatusUpdateRequest;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import java.util.List;

@ApplicationScoped
public class TableClient {

    @Inject
    @RestClient
    TableRestClient tableRestClient;

    public List<CafeTableResponse> getAllTables(String token) {
        ApiResponse<List<CafeTableResponse>> response = tableRestClient.getAllTables(formatToken(token));
        return response != null ? response.getResult() : List.of();
    }

    public CafeTableResponse updateTableStatus(String tableNumber, Integer status, String token) {
        TableStatusUpdateRequest request = TableStatusUpdateRequest.builder()
                .status(status)
                .build();
        ApiResponse<CafeTableResponse> response = tableRestClient.updateTableStatus(tableNumber, request, formatToken(token));
        return response != null ? response.getResult() : null;
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