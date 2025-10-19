package com.example.demo_database.mapper;

import com.example.demo_database.dto.request.UserCreationRequest;
import com.example.demo_database.dto.request.UserUpdateRequest;
import com.example.demo_database.dto.response.UserReponse;
import com.example.demo_database.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);

//    @Mapping(source =)
    UserReponse toUserReponse (User user);


    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
