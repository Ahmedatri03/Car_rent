package com.carrent.carservice.auth;

import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthUserRepository authUserRepository;

    public AuthService(AuthUserRepository authUserRepository) {
        this.authUserRepository = authUserRepository;
    }

    public Long register(String username, String password) {
        String u = normalize(username);
        if (u.isEmpty()) {
            throw new IllegalArgumentException("Username obligatoire");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Mot de passe obligatoire");
        }
        if (authUserRepository.existsById(u)) {
            throw new IllegalArgumentException("Compte existe deja");
        }
        authUserRepository.save(new AuthUser(u, password));
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

        AuthUser user = authUserRepository.findById(u).orElse(null);
        if (user == null) {
            throw new IllegalArgumentException("Compte introuvable");
        }
        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Mot de passe incorrect");
        }
        return UserIdGenerator.fromUsername(u);
    }

    private static String normalize(String username) {
        return username == null ? "" : username.toLowerCase().trim();
    }
}

