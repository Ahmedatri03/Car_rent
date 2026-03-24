package com.carrent.bankservice.service;

import com.carrent.bankservice.model.BankAccount;
import com.carrent.bankservice.repository.BankAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BankAccountService {
    private final BankAccountRepository bankAccountRepository;

    public BankAccountService(BankAccountRepository bankAccountRepository) {
        this.bankAccountRepository = bankAccountRepository;
    }

    public BankAccount create(BankAccount account) {
        return bankAccountRepository.save(account);
    }

    public List<BankAccount> findAll() {
        return bankAccountRepository.findAll();
    }

    public BankAccount findById(Long id) {
        return bankAccountRepository.findById(id).orElse(null);
    }

    public BankAccount findByUserId(Long userId) {
        return bankAccountRepository.findByUserId(userId).orElse(null);
    }

    public BankAccount update(Long id, BankAccount updated) {
        BankAccount existing = findById(id);
        if (existing == null) {
            return null;
        }
        existing.setUserId(updated.getUserId());
        existing.setOwnerName(updated.getOwnerName());
        existing.setBalance(updated.getBalance());
        return bankAccountRepository.save(existing);
    }

    public boolean delete(Long id) {
        if (!bankAccountRepository.existsById(id)) {
            return false;
        }
        bankAccountRepository.deleteById(id);
        return true;
    }

    @Transactional
    public boolean debit(Long userId, Double amount) {
        BankAccount account = findByUserId(userId);
        if (account == null || account.getBalance() < amount) {
            return false;
        }
        account.setBalance(account.getBalance() - amount);
        bankAccountRepository.save(account);
        return true;
    }
}
