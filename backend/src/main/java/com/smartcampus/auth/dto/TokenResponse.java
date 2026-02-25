package com.smartcampus.auth.dto;

public class TokenResponse {
    private String tokenType = "Bearer";
    private String accessToken;
    private String refreshToken;
    private long expiresInSeconds;

    public TokenResponse(String accessToken, String refreshToken, long expiresInSeconds) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresInSeconds = expiresInSeconds;
    }

    public String getTokenType() {
        return tokenType;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public long getExpiresInSeconds() {
        return expiresInSeconds;
    }
}
