package com.example.demo_database.feature.user.service;


import com.example.demo_database.common.exception.AppException;
import com.example.demo_database.common.exception.ErrorCode;
import com.example.demo_database.feature.user.Role.Roles;
import com.example.demo_database.feature.user.dto.request.UserCreationRequest;
import com.example.demo_database.feature.user.dto.request.UserUpdateRequest;
import com.example.demo_database.feature.user.dto.response.UserReponse;
import com.example.demo_database.feature.user.entity.Users;
import com.example.demo_database.feature.user.mapper.UserMapper;
import com.example.demo_database.feature.user.repository.UserRepository;
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
public UserReponse createUser(UserCreationRequest request){
    if (userRepository.existsByUsername(request.getUsername()))
        throw new AppException(ErrorCode.USER_EXISTED);

    Users user = userMapper.toUser(request);
    user.setPassword(passwordEncoder.encode(request.getPassword()));

    HashSet<String> roles= new HashSet<>();
    roles.add(Roles.USER.name());
    user.setRoles(roles);
    return userMapper.toUserReponse(userRepository.save(user));
}

    public List<UserReponse> getUsers(){
        return userRepository.findAll().stream()
                .map(userMapper::toUserReponse).toList();
    }

    public UserReponse getUserId(String userId){
        return userMapper.toUserReponse(userRepository.findById(userId).orElseThrow(() -> new RuntimeException("user not found")));
    }
    public void deleteUserId(String userId){
        userRepository.deleteById(userId);
    }

    public UserReponse updateUser(String userId, UserUpdateRequest request) {
        Users user= userRepository.findById(userId).orElseThrow(()-> new RuntimeException("user not found"));

        userMapper.updateUser(user,request);

        return userMapper.toUserReponse(userRepository.save(user));
    }
//    public User getUserName(String userName){
//        return userRepsitory.findByUsername(userName).orElseThrow(()-> new RuntimeException("sai user hoặc password"));
//    }
}
