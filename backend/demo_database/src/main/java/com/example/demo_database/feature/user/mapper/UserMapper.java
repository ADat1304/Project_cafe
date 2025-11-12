package com.example.demo_database.feature.user.mapper;




import com.example.demo_database.feature.user.dto.request.UserCreationRequest;
import com.example.demo_database.feature.user.dto.request.UserUpdateRequest;
import com.example.demo_database.feature.user.dto.response.UserReponse;
import com.example.demo_database.feature.user.entity.Users;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    Users toUser(UserCreationRequest request);

    //    @Mapping(source =)
    UserReponse toUserReponse (Users user);


    void updateUser(@MappingTarget Users user, UserUpdateRequest request);
}

