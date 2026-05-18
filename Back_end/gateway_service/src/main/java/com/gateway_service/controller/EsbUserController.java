package com.gateway_service.controller;

import com.gateway_service.client.UserClient;
import com.gateway_service.dto.user.UserCreationRequest;
import com.gateway_service.dto.user.UserResponse;
import com.gateway_service.dto.user.UserUpdateRequest;
import lombok.RequiredArgsConstructor;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.annotation.security.RolesAllowed;
import jakarta.annotation.security.PermitAll;

import java.util.List;

@Path("/esb/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class EsbUserController {

    private final UserClient userClient;

    @POST
    @PermitAll
    public UserResponse createUser(
            UserCreationRequest request,
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return userClient.createUser(request, token);
    }

    @GET
    @RolesAllowed("ADMIN")
    public List<UserResponse> listUsers(
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return userClient.getUsers(token);
    }

    @GET
    @Path("/{userId}")
    @RolesAllowed("ADMIN")
    public UserResponse getUserById(
            @PathParam("userId") String userId,
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return userClient.getUserById(userId, token);
    }

    @PUT
    @Path("/{userId}")
    @RolesAllowed("ADMIN")
    public UserResponse updateUser(
            @PathParam("userId") String userId,
            UserUpdateRequest request,
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return userClient.updateUser(userId, request, token);
    }

    @DELETE
    @Path("/{userId}")
    @RolesAllowed("ADMIN")
    public Response deleteUser(
            @PathParam("userId") String userId,
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        userClient.deleteUser(userId, token);
        return Response.noContent().build();
    }
}