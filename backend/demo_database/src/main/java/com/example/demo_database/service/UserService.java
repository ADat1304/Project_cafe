package com.example.demo_database.service;

import com.example.demo_database.dto.request.UserCreationRequest;
import com.example.demo_database.dto.request.UserUpdateRequest;
import com.example.demo_database.dto.response.UserReponse;
import com.example.demo_database.entity.User;
import com.example.demo_database.exception.AppException;
import com.example.demo_database.exception.ErrorCode;
import com.example.demo_database.mapper.UserMapper;
import com.example.demo_database.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository ;

    UserMapper userMapper;

    public User creatRequest(UserCreationRequest request){

        if(userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTED);

//        UserCreationRequest request1= UserCreationRequest.builder().
//                username("abc").
//                password("xyz").
//                build();
        User user= userMapper.toUser(request);

        return userRepository.save(user);
    }

    public List<User> getUsers(){
        return userRepository.findAll();
    }

    public UserReponse getUserId(String userId){
        return userMapper.toUserReponse(userRepository.findById(userId).orElseThrow(() -> new RuntimeException("user not found")));
    }
    public void deleteUserId(String userId){
        userRepository.deleteById(userId);
    }

    public UserReponse updateUser(String userId, UserUpdateRequest request) {
        User user= userRepository.findById(userId).orElseThrow(()-> new RuntimeException("user not found"));

        userMapper.updateUser(user,request);

        return userMapper.toUserReponse(userRepository.save(user));
    }
//    public User getUserName(String userName){
//        return userRepsitory.findByUsername(userName).orElseThrow(()-> new RuntimeException("sai user hoặc password"));
//    }
}
