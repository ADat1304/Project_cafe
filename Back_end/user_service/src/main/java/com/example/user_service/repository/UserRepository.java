package com.example.user_service.repository;

import com.example.user_service.entity.Users;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

@ApplicationScoped
public class UserRepository implements PanacheRepositoryBase<Users, String> {
    public boolean existsByUsername(String username) {
        return count("username", username) > 0;
    }

    public Optional<Users> findByUsername(String username) {
        return find("username", username).firstResultOptional();
    }
}
