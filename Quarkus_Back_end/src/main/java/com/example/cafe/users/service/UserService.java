package com.example.cafe.users.service;

import com.example.cafe.users.Role.Roles;
import com.example.cafe.common.exception.AppException;
import com.example.cafe.common.exception.ErrorCode;
import com.example.cafe.users.dto.request.UserCreationRequest;
import com.example.cafe.users.dto.request.UserUpdateRequest;
import com.example.cafe.users.dto.response.UserResponse;
import com.example.cafe.users.entity.Users;
import com.example.cafe.users.mapper.UserMapper;
import com.example.cafe.users.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

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
        user.setPassword(request.getPassword());

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
            user.setPassword(request.getPassword());
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
                .or(() -> userRepository.findByUsername(userId).map(userMapper::toUserReponse))
                .orElseThrow(() -> new RuntimeException("user not found"));
    }

    @Transactional
    public void deleteUserId(String userId) {
        userRepository.deleteById(userId);
    }
}
