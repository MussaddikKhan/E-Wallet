package com.e_wallet.bank.repository;

import com.e_wallet.bank.Model.Bank;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankRepository extends JpaRepository<Bank, Long> {
    Bank findByAccountNumber(String accountNumber);

    Bank findByPhoneNumber(String phoneNumber);
}
