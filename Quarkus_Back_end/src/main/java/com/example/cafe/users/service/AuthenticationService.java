package com.example.cafe.users.service;

import com.example.cafe.common.exception.AppException;
import com.example.cafe.common.exception.ErrorCode;
import com.example.cafe.users.dto.request.AuthenticationRequest;
import com.example.cafe.users.dto.response.AuthenticationReponse;
import com.example.cafe.users.entity.Users;
import com.example.cafe.users.repository.UserRepository;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.HashSet;
import java.util.Set;

@ApplicationScoped
public class AuthenticationService {

    @Inject
    UserRepository userRepository;

    public AuthenticationReponse authenticate(AuthenticationRequest request) {
        Users user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated = request.getPassword().equals(user.getPassword());
        if (!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String token = generateToken(user);

        return AuthenticationReponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    private String generateToken(Users user) {
        Set<String> roles = user.getRoles() != null ? user.getRoles() : new HashSet<>();
        
        return Jwt.issuer("http://localhost:8080")
                .subject(user.getUsername())
                .groups(roles) // Map to "scope" in config
                .claim("scope", String.join(" ", roles)) // Keep for compatibility if needed
                .sign();
    }
}
