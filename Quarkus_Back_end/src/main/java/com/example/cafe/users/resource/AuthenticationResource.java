package com.example.cafe.users.resource;

import com.example.cafe.common.ApiResponse;
import com.example.cafe.users.dto.request.AuthenticationRequest;
import com.example.cafe.users.dto.response.AuthenticationReponse;
import com.example.cafe.users.service.AuthenticationService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import jakarta.annotation.security.PermitAll;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
public class AuthenticationResource {

    @Inject
    AuthenticationService authenticationService;

    @POST
    @Path("/login")
    public ApiResponse<AuthenticationReponse> authenticate(AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationReponse>builder()
                .result(result)
                .build();
    }
}
