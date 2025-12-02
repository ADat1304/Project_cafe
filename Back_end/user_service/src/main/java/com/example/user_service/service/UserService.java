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
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository ;
    PasswordEncoder passwordEncoder;
    UserMapper userMapper;

//    public User creatRequest(UserCreationRequest request){
//
//        if(userRepository.existsByUsername(request.getUsername()))
//            throw new AppException(ErrorCode.USER_EXISTED);
//
////        UserCreationRequest request1= UserCreationRequest.builder().
////                username("abc").
////                password("xyz").
////                build();
//        User user= userMapper.toUser(request);
//
//        return userRepository.save(user);
//    }
public UserResponse createUser(UserCreationRequest request){
    if (userRepository.existsByUsername(request.getUsername()))
        throw new AppException(ErrorCode.USER_EXISTED);

    Users user = userMapper.toUser(request);
    user.setPassword(passwordEncoder.encode(request.getPassword()));

    HashSet<String> roles= new HashSet<>();
    roles.add(Roles.USER.name());
    user.setRoles(roles);
    return userMapper.toUserReponse(userRepository.save(user));
}

    public List<UserResponse> getUsers(){
        return userRepository.findAll().stream()
                .map(userMapper::toUserReponse).toList();
    }

    public UserResponse getUserId(String userId){
        return userMapper.toUserReponse(userRepository.findById(userId).orElseThrow(() -> new RuntimeException("user not found")));
    }
    public void deleteUserId(String userId){
        userRepository.deleteById(userId);
    }

    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        Users user= userRepository.findById(userId).orElseThrow(()-> new RuntimeException("user not found"));

        if (request.getFullname() != null && !request.getFullname().isBlank()) {
            user.setFullname(request.getFullname());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return userMapper.toUserReponse(userRepository.save(user));
    }
//    public User getUserName(String userName){
//        return userRepsitory.findByUsername(userName).orElseThrow(()-> new RuntimeException("sai user hoặc password"));
//    }
}
