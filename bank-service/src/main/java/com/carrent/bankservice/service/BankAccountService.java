package com.carrent.bankservice.service;

import com.carrent.bankservice.model.BankAccount;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class BankAccountService {
    private final Map<Long, BankAccount> accounts = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(1);

    public BankAccount create(BankAccount account) {
        long id = sequence.getAndIncrement();
        account.setId(id);
        accounts.put(id, account);
        return account;
    }

    public List<BankAccount> findAll() {
        return new ArrayList<>(accounts.values());
    }

    public BankAccount findById(Long id) {
        return accounts.get(id);
    }

    public BankAccount findByUserId(Long userId) {
        return accounts.values().stream()
                .filter(a -> a.getUserId().equals(userId))
                .findFirst()
                .orElse(null);
    }

    public BankAccount update(Long id, BankAccount updated) {
        BankAccount existing = accounts.get(id);
        if (existing == null) {
            return null;
        }
        existing.setUserId(updated.getUserId());
        existing.setOwnerName(updated.getOwnerName());
        existing.setBalance(updated.getBalance());
        return existing;
    }

    public boolean delete(Long id) {
        return accounts.remove(id) != null;
    }

    public boolean debit(Long userId, Double amount) {
        BankAccount account = findByUserId(userId);
        if (account == null || account.getBalance() < amount) {
            return false;
        }
        account.setBalance(account.getBalance() - amount);
        return true;
    }
}
