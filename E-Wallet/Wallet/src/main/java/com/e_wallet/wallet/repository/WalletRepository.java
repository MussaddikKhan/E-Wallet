package com.e_wallet.wallet.repository;

import com.e_wallet.wallet.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletRepository extends JpaRepository<Wallet , Long> {
    Wallet findByPhoneNumber(String phoneNumber);
}
