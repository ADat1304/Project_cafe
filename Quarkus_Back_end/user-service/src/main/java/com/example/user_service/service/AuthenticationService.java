package com.example.user_service.service;

import com.example.user_service.common.exception.AppException;
import com.example.user_service.common.exception.ErrorCode;
import com.example.user_service.dto.request.AuthenticationRequest;
import com.example.user_service.dto.response.AuthenticationReponse;
import com.example.user_service.entity.Users;
import com.example.user_service.repository.UserRepository;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.mindrot.jbcrypt.BCrypt;

import java.util.HashSet;
import java.util.Set;

@ApplicationScoped
public class AuthenticationService {

    @Inject
    UserRepository userRepository;

    public AuthenticationReponse authenticate(AuthenticationRequest request) {
        Users user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated = BCrypt.checkpw(request.getPassword(), user.getPassword());
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
