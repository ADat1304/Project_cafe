package com.example.demo_database.feature.user.repository;



import com.example.demo_database.feature.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users, String> {
    boolean existsByUsername(String username);
    Optional<Users> findByUsername(String username);

}
