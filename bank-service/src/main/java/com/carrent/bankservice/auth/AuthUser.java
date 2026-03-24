package com.carrent.bankservice.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bank_auth_users")
public class AuthUser {
    @Id
    @Column(nullable = false, length = 100)
    private String username;

    @Column(nullable = false)
    private String password;
}

