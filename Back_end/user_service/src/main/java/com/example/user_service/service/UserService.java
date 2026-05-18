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
import com.example.user_service.Configuation.PasswordEncoder;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.List;

@ApplicationScoped
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    UserMapper userMapper;

    @Transactional
    public UserResponse createUser(UserCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTED);

        Users user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

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
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            user.setRoles(new HashSet<>(request.getRoles()));
        }

        userRepository.persist(user);
        return userMapper.toUserReponse(user);
    }

    public List<UserResponse> getUsers(){
        return userRepository.listAll().stream()
                .map(userMapper::toUserReponse).toList();
    }

    public UserResponse getUserId(String userId){
        return userMapper.toUserReponse(userRepository.findByIdOptional(userId)
                .orElseThrow(() -> new RuntimeException("user not found")));
    }

    @Transactional
    public void deleteUserId(String userId){
        userRepository.deleteById(userId);
    }
}
