package com.e_wallet.transaction.repository;

import com.e_wallet.transaction.Model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Transaction findByTxnId(String externalTxnId);

    List<Transaction> findBySenderOrReceiver(String sender, String receiver);
}
