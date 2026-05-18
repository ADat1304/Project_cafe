package com.gateway_service.controller;

import com.gateway_service.client.AuthClient;
import com.gateway_service.dto.auth.AuthenticationRequest;
import com.gateway_service.dto.auth.AuthenticationResponse;
import com.gateway_service.dto.auth.IntrospectResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.annotation.security.PermitAll;

@Slf4j
@Path("/esb/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class EsbAuthController {

    private final AuthClient authClient;

    @POST
    @Path("/login")
    @PermitAll
    public AuthenticationResponse login(AuthenticationRequest request) {
        return authClient.authenticate(request);
    }

    @POST
    @Path("/validate")
    @PermitAll
    public IntrospectResponse validate(@HeaderParam("Authorization") String authorization) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        log.debug("Validating token through ESB");
        return authClient.introspect(token);
    }
}