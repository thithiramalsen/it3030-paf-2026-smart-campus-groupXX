package com.smartcampus.user.dto;

import com.smartcampus.user.AccountStatus;
import com.smartcampus.user.Role;
import com.smartcampus.user.User;
import java.time.Instant;
import java.util.UUID;

public class UserViewDto {

    private UUID id;
    private String fullName;
    private String email;
    private Role role;
    private AccountStatus accountStatus;
    private String userType;
    private String profileImageUrl;
    private Instant createdAt;

    public UserViewDto() {
    }

    public UserViewDto(UUID id, String fullName, String email, Role role, AccountStatus accountStatus,
                       String userType, String profileImageUrl, Instant createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.accountStatus = accountStatus;
        this.userType = userType;
        this.profileImageUrl = profileImageUrl;
        this.createdAt = createdAt;
    }

    public static UserViewDto from(User user) {
        return new UserViewDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getAccountStatus(),
                user.getUserType(),
                user.getProfileImageUrl(),
                user.getCreatedAt()
        );
    }

    public UUID getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public String getUserType() {
        return userType;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
