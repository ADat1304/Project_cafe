package com.gateway_service.client;

import com.gateway_service.common.ApiResponse;
import com.gateway_service.dto.auth.AuthenticationRequest;
import com.gateway_service.dto.auth.AuthenticationResponse;
import com.gateway_service.dto.auth.IntrospectRequest;
import com.gateway_service.dto.auth.IntrospectResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "user-client")
@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface AuthRestClient {

    @POST
    @Path("/token")
    ApiResponse<AuthenticationResponse> authenticate(AuthenticationRequest request);

    @POST
    @Path("/introspect")
    ApiResponse<IntrospectResponse> introspect(IntrospectRequest request);
}
