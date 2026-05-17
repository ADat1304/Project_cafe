package com.example.cafe.users.mapper;

import com.example.cafe.users.dto.request.UserCreationRequest;
import com.example.cafe.users.dto.request.UserUpdateRequest;
import com.example.cafe.users.dto.response.UserResponse;
import com.example.cafe.users.entity.Users;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA)
public interface UserMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "roles", ignore = true)
    Users toUser(UserCreationRequest request);

    UserResponse toUserReponse(Users user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget Users user, UserUpdateRequest request);
}
