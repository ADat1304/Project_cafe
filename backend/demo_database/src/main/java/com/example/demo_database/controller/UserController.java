package com.example.demo_database.controller;

import com.example.demo_database.dto.request.ApiResponse;
import com.example.demo_database.dto.request.UserCreationRequest;
import com.example.demo_database.dto.request.UserUpdateRequest;
import com.example.demo_database.dto.response.UserReponse;
import com.example.demo_database.entity.User;

import com.example.demo_database.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
     UserService userService;

//    @PostMapping
//    ApiResponse<User> createUser(@RequestBody @Valid UserCreationRequest request){
//        ApiResponse<User> apiResponse = new ApiResponse<>();
//
//        apiResponse.setResult(userService.creatRequest(request));
//        return apiResponse;
//    }
@PostMapping
ApiResponse<UserReponse> createUser(@RequestBody @Valid UserCreationRequest request){
    ApiResponse<UserReponse> apiResponse = new ApiResponse<>();

    apiResponse.setResult(userService.createUser(request));

    return apiResponse;
}

    @GetMapping
    List<User> getUsers(){
        return userService.getUsers();
    }

    @GetMapping("/{userId}")
    UserReponse getUserId(@PathVariable("userId") String userId){
        return userService.getUserId(userId);
    }

    @DeleteMapping("/{userId}")
    String deleteUserId(@PathVariable("userId") String userId){
        userService.deleteUserId(userId);
        return "user has deleted";
    }

    @PutMapping("/{userId}")
    UserReponse updateUser(@PathVariable String userId,@RequestBody UserUpdateRequest request) {
        return userService.updateUser(userId,request);
    }
}
