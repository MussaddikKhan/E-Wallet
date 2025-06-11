package com.e_wallet.transaction.repository;

import com.e_wallet.transaction.Model.Transaction;
import com.e_wallet.transaction.Model.TransactionType;
import com.e_wallet.transaction.Model.TxnStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Transaction findByTxnId(String externalTxnId);

    List<Transaction> findBySenderOrReceiver(String sender, String receiver);

    @Query("SELECT t FROM Transaction t " +
            "WHERE (t.sender = :sender AND t.transactionType = :debit) " +
            "OR (t.receiver = :sender AND t.transactionType = :credit)  ORDER BY t.updatedOn DESC")
    
    List<Transaction> findTxnWithStatus(
            @Param("sender") String sender,
            @Param("debit") TransactionType debit,
            @Param("credit") TransactionType credit)
   ;
}
