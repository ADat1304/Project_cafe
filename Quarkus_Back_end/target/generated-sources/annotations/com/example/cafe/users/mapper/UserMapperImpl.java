package com.example.cafe.users.mapper;

import com.example.cafe.users.dto.request.UserCreationRequest;
import com.example.cafe.users.dto.request.UserUpdateRequest;
import com.example.cafe.users.dto.response.UserResponse;
import com.example.cafe.users.entity.Users;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.LinkedHashSet;
import java.util.Set;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-17T09:37:21+0700",
    comments = "version: 1.6.0, compiler: javac, environment: Java 21.0.10 (Oracle Corporation)"
)
@Singleton
@Named
public class UserMapperImpl implements UserMapper {

    @Override
    public Users toUser(UserCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        Users.UsersBuilder users = Users.builder();

        users.username( request.getUsername() );
        users.fullname( request.getFullname() );

        return users.build();
    }

    @Override
    public UserResponse toUserReponse(Users user) {
        if ( user == null ) {
            return null;
        }

        UserResponse.UserResponseBuilder userResponse = UserResponse.builder();

        userResponse.id( user.getId() );
        userResponse.username( user.getUsername() );
        userResponse.fullname( user.getFullname() );
        Set<String> set = user.getRoles();
        if ( set != null ) {
            userResponse.roles( new LinkedHashSet<String>( set ) );
        }

        return userResponse.build();
    }

    @Override
    public void updateUser(Users user, UserUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        user.setFullname( request.getFullname() );
    }
}
