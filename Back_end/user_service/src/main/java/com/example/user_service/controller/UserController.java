package com.example.user_service.controller;

import com.example.user_service.common.ApiResponse;
import com.example.user_service.dto.request.UserCreationRequest;
import com.example.user_service.dto.request.UserUpdateRequest;
import com.example.user_service.dto.response.UserResponse;
import com.example.user_service.service.UserService;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.jwt.JsonWebToken;
import jakarta.inject.Inject;

import java.util.List;

@Slf4j
@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;

    @Inject
    JsonWebToken jwt;

    @POST
    public ApiResponse<UserResponse> createUser(@Valid UserCreationRequest request){
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    @GET
    public ApiResponse<List<UserResponse>> getUsers(){
        if (jwt != null && jwt.getName() != null) {
            log.info("user name: {}", jwt.getName());
            jwt.getGroups().forEach(role -> log.info(role));
        }

        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getUsers())
                .build();
    }

    @GET
    @Path("/{userId}")
    public UserResponse getUserId(@PathParam("userId") String userId){
        return userService.getUserId(userId);
    }

    @DELETE
    @Path("/{userId}")
    public String deleteUserId(@PathParam("userId") String userId){
        userService.deleteUserId(userId);
        return "user has deleted";
    }

    @PUT
    @Path("/{userId}")
    public UserResponse updateUser(@PathParam("userId") String userId, UserUpdateRequest request) {
        return userService.updateUser(userId, request);
    }
}
