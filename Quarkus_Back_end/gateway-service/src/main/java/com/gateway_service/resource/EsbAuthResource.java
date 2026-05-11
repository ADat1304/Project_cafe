package com.gateway_service.resource;

import com.gateway_service.client.AuthClient;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@Path("/esb/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EsbAuthResource {

    @Inject
    @RestClient
    AuthClient authClient;

    @POST
    @Path("/login")
    public Object login(Object request) {
        return authClient.authenticate(request);
    }
}
