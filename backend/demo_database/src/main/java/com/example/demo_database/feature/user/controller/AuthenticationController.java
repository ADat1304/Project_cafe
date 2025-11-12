package com.example.demo_database.feature.user.controller;


import com.example.demo_database.common.ApiResponse;
import com.example.demo_database.feature.user.dto.request.AuthenticationRequest;
import com.example.demo_database.feature.user.dto.request.IntrospectRequest;
import com.example.demo_database.feature.user.dto.response.AuthenticationReponse;
import com.example.demo_database.feature.user.dto.response.IntrospectReponse;
import com.example.demo_database.feature.user.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;

    @PostMapping("/token")
    ApiResponse<AuthenticationReponse> authenticate(@RequestBody AuthenticationRequest request){
        var result = authenticationService.authenticate(request);
        return ApiResponse. <AuthenticationReponse>builder()
                .result(result)
                .build();
    }
    @PostMapping("/introspect")
    ApiResponse<IntrospectReponse> introspect(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse. <IntrospectReponse>builder()
                .result(result)
                .build();
    }
}
