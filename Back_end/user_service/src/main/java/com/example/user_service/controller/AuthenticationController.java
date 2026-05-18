package com.example.user_service.controller;

import com.example.user_service.common.ApiResponse;
import com.example.user_service.dto.request.AuthenticationRequest;
import com.example.user_service.dto.request.IntrospectRequest;
import com.example.user_service.dto.response.AuthenticationReponse;
import com.example.user_service.dto.response.IntrospectReponse;
import com.example.user_service.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.text.ParseException;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;

    @POST
    @Path("/token")
    public ApiResponse<AuthenticationReponse> authenticate(AuthenticationRequest request){
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationReponse>builder()
                .result(result)
                .build();
    }

    @POST
    @Path("/introspect")
    public ApiResponse<IntrospectReponse> introspect(IntrospectRequest request) throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectReponse>builder()
                .result(result)
                .build();
    }
}
