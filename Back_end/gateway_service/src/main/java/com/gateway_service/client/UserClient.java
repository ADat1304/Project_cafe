package com.gateway_service.client;

import com.gateway_service.common.ApiResponse;
import com.gateway_service.dto.user.UserCreationRequest;
import com.gateway_service.dto.user.UserResponse;
import com.gateway_service.dto.user.UserUpdateRequest;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import java.util.List;

@ApplicationScoped
public class UserClient {

    @Inject
    @RestClient
    UserRestClient userRestClient;

    public UserResponse createUser(UserCreationRequest request, String token) {
        ApiResponse<UserResponse> response = userRestClient.createUser(request, formatToken(token));
        return response != null ? response.getResult() : null;
    }

    public List<UserResponse> getUsers(String token) {
        ApiResponse<List<UserResponse>> response = userRestClient.getUsers(formatToken(token));
        return response != null ? response.getResult() : List.of();
    }

    public UserResponse getUserById(String userId, String token) {
        ApiResponse<UserResponse> response = userRestClient.getUserById(userId, formatToken(token));
        return response != null ? response.getResult() : null;
    }

    public UserResponse updateUser(String userId, UserUpdateRequest request, String token) {
        ApiResponse<UserResponse> response = userRestClient.updateUser(userId, request, formatToken(token));
        return response != null ? response.getResult() : null;
    }

    public void deleteUser(String userId, String token) {
        userRestClient.deleteUser(userId, formatToken(token));
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