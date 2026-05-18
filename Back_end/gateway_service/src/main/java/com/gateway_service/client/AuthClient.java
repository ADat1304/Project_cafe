package com.gateway_service.client;

import com.gateway_service.common.ApiResponse;
import com.gateway_service.dto.auth.AuthenticationRequest;
import com.gateway_service.dto.auth.AuthenticationResponse;
import com.gateway_service.dto.auth.IntrospectRequest;
import com.gateway_service.dto.auth.IntrospectResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@ApplicationScoped
public class AuthClient {

    @Inject
    @RestClient
    AuthRestClient authRestClient;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        ApiResponse<AuthenticationResponse> response = authRestClient.authenticate(request);
        return response != null ? response.getResult() : null;
    }

    public IntrospectResponse introspect(String token) {
        IntrospectRequest request = new IntrospectRequest();
        request.setToken(token);
        ApiResponse<IntrospectResponse> response = authRestClient.introspect(request);
        return response != null ? response.getResult() : null;
    }
}