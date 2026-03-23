package com.carrent.carservice.auth;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    // Demo-only in-memory auth store (no persistence).
    private final Map<String, String> users = new ConcurrentHashMap<>();

    public Long register(String username, String password) {
        String u = normalize(username);
        if (u.isEmpty()) {
            throw new IllegalArgumentException("Username obligatoire");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Mot de passe obligatoire");
        }
        if (users.containsKey(u)) {
            throw new IllegalArgumentException("Compte existe deja");
        }
        users.put(u, password);
        return UserIdGenerator.fromUsername(u);
    }

    public Long login(String username, String password) {
        String u = normalize(username);
        if (u.isEmpty()) {
            throw new IllegalArgumentException("Username obligatoire");
        }
        if (password == null) {
            throw new IllegalArgumentException("Mot de passe obligatoire");
        }

        String savedPassword = users.get(u);
        if (savedPassword == null) {
            throw new IllegalArgumentException("Compte introuvable");
        }
        if (!savedPassword.equals(password)) {
            throw new IllegalArgumentException("Mot de passe incorrect");
        }
        return UserIdGenerator.fromUsername(u);
    }

    private static String normalize(String username) {
        return username == null ? "" : username.toLowerCase().trim();
    }
}

