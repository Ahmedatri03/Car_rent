package com.carrent.bankservice.auth;

public class UserIdGenerator {
    private UserIdGenerator() {}

    // Deterministic mapping to match the car-service.
    public static long fromUsername(String username) {
        String s = username == null ? "" : username.toLowerCase().trim();
        long hash = 0;
        for (int i = 0; i < s.length(); i++) {
            hash = (hash * 31 + (int) s.charAt(i)) & 0xFFFFFFFFL;
        }
        return (hash % 1000000L) + 1L;
    }
}

