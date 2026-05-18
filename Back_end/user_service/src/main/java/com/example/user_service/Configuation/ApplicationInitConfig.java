package com.example.user_service.Configuation;

import com.example.user_service.Role.Roles;
import com.example.user_service.entity.Users;
import com.example.user_service.repository.UserRepository;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import java.util.HashSet;

@ApplicationScoped
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;

    @Transactional
    public void onStart(@Observes StartupEvent ev) {
        if(userRepository.findByUsername("admin").isEmpty()){
            var roles= new HashSet<String>();
            roles.add(Roles.ADMIN.name());

            Users user = Users.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin"))
                    .roles(roles)
                    .build();
            userRepository.persist(user);
            log.warn("admin user has created with default password: admin");
        }
    }
}
