package com.example.demo_database.feature.user.controller;





import com.example.demo_database.common.ApiResponse;
import com.example.demo_database.feature.user.dto.request.UserCreationRequest;
import com.example.demo_database.feature.user.dto.request.UserUpdateRequest;
import com.example.demo_database.feature.user.dto.response.UserReponse;
import com.example.demo_database.feature.user.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;


    @PostMapping
    ApiResponse<UserReponse> createUser(@RequestBody @Valid UserCreationRequest request){
        return ApiResponse.<UserReponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<UserReponse>> getUsers(){

        var authentication = SecurityContextHolder.getContext().getAuthentication();

        log.info("user name: {}", authentication.getName());
        authentication.getAuthorities().forEach(
                grantedAuthority -> log.info(grantedAuthority.getAuthority()));

        return ApiResponse.<List<UserReponse>>builder()
                .result(userService.getUsers())
                .build();
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
