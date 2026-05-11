package com.example.user_service.resource;

import com.example.user_service.common.ApiResponse;
import com.example.user_service.dto.request.UserCreationRequest;
import com.example.user_service.dto.request.UserUpdateRequest;
import com.example.user_service.dto.response.UserResponse;
import com.example.user_service.service.UserService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    UserService userService;

    @POST
    public ApiResponse<UserResponse> createUser(@Valid UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    @GET
    @RolesAllowed("ADMIN")
    public ApiResponse<List<UserResponse>> getUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getUsers())
                .build();
    }

    @GET
    @Path("/{userId}")
    public UserResponse getUserId(@PathParam("userId") String userId) {
        return userService.getUserId(userId);
    }

    @DELETE
    @Path("/{userId}")
    @RolesAllowed("ADMIN")
    public String deleteUserId(@PathParam("userId") String userId) {
        userService.deleteUserId(userId);
        return "user has deleted";
    }

    @PUT
    @Path("/{userId}")
    public UserResponse updateUser(@PathParam("userId") String userId, UserUpdateRequest request) {
        return userService.updateUser(userId, request);
    }
}
