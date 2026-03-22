package com.carrent.bankservice.controller;

import com.carrent.bankservice.model.BankAccount;
import com.carrent.bankservice.service.BankAccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RequestMapping("/api/accounts")
public class BankAccountController {
    private final BankAccountService bankAccountService;

    public BankAccountController(BankAccountService bankAccountService) {
        this.bankAccountService = bankAccountService;
    }

    @PostMapping
    public ResponseEntity<BankAccount> create(@RequestBody BankAccount account) {
        return ResponseEntity.ok(bankAccountService.create(account));
    }

    @GetMapping
    public ResponseEntity<List<BankAccount>> list() {
        return ResponseEntity.ok(bankAccountService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BankAccount> get(@PathVariable Long id) {
        BankAccount account = bankAccountService.findById(id);
        return account == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(account);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<BankAccount> getByUserId(@PathVariable Long userId) {
        BankAccount account = bankAccountService.findByUserId(userId);
        return account == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(account);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BankAccount> update(@PathVariable Long id, @RequestBody BankAccount account) {
        BankAccount updated = bankAccountService.update(id, account);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return bankAccountService.delete(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
