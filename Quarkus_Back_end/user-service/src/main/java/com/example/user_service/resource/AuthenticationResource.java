package com.example.user_service.resource;

import com.example.user_service.common.ApiResponse;
import com.example.user_service.dto.request.AuthenticationRequest;
import com.example.user_service.dto.response.AuthenticationReponse;
import com.example.user_service.service.AuthenticationService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthenticationResource {

    @Inject
    AuthenticationService authenticationService;

    @POST
    @Path("/token")
    public ApiResponse<AuthenticationReponse> authenticate(AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationReponse>builder()
                .result(result)
                .build();
    }
}
