package com.example.demo_database.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
     String username;

    @Size(min = 8, message = "PASSWORD_INVALID")
     String password;
     String fullname;
     String role;

}
