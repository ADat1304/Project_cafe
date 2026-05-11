package com.example.user_service.service;

import com.example.user_service.Role.Roles;
import com.example.user_service.common.exception.AppException;
import com.example.user_service.common.exception.ErrorCode;
import com.example.user_service.dto.request.UserCreationRequest;
import com.example.user_service.dto.request.UserUpdateRequest;
import com.example.user_service.dto.response.UserResponse;
import com.example.user_service.entity.Users;
import com.example.user_service.mapper.UserMapper;
import com.example.user_service.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.mindrot.jbcrypt.BCrypt;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class UserService {

    @Inject
    UserRepository userRepository;

    @Inject
    UserMapper userMapper;

    @Transactional
    public UserResponse createUser(UserCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTED);

        Users user = userMapper.toUser(request);
        user.setPassword(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt(10)));

        HashSet<String> roles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            roles.addAll(request.getRoles());
        } else {
            roles.add(Roles.USER.name());
        }
        user.setRoles(roles);

        userRepository.persist(user);
        return userMapper.toUserReponse(user);
    }

    @Transactional
    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        Users user = userRepository.findByIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("user not found"));

        if (request.getFullname() != null && !request.getFullname().isBlank()) {
            user.setFullname(request.getFullname());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt(10)));
        }

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            user.setRoles(new HashSet<>(request.getRoles()));
        }

        return userMapper.toUserReponse(user);
    }

    public List<UserResponse> getUsers() {
        return userRepository.listAll().stream()
                .map(userMapper::toUserReponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserId(String userId) {
        return userRepository.findByIdOptional(userId)
                .map(userMapper::toUserReponse)
                .orElseThrow(() -> new RuntimeException("user not found"));
    }

    @Transactional
    public void deleteUserId(String userId) {
        userRepository.deleteById(userId);
    }
}
