package com.gateway_service.client;

import com.gateway_service.common.ApiResponse;
import com.gateway_service.dto.user.UserCreationRequest;
import com.gateway_service.dto.user.UserResponse;
import com.gateway_service.dto.user.UserUpdateRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import java.util.List;

@RegisterRestClient(configKey = "user-client")
@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface UserRestClient {

    @POST
    ApiResponse<UserResponse> createUser(UserCreationRequest request, @HeaderParam("Authorization") String token);

    @GET
    ApiResponse<List<UserResponse>> getUsers(@HeaderParam("Authorization") String token);

    @GET
    @Path("/{userId}")
    ApiResponse<UserResponse> getUserById(@PathParam("userId") String userId, @HeaderParam("Authorization") String token);

    @PUT
    @Path("/{userId}")
    ApiResponse<UserResponse> updateUser(@PathParam("userId") String userId, UserUpdateRequest request, @HeaderParam("Authorization") String token);

    @DELETE
    @Path("/{userId}")
    void deleteUser(@PathParam("userId") String userId, @HeaderParam("Authorization") String token);
}
