package com.carrent.carservice.auth;

public class AuthResponse {
    private Long userId;

    public AuthResponse() {}

    public AuthResponse(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}

