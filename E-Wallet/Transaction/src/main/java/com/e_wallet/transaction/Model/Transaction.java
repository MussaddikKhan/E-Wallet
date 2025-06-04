package com.e_wallet.transaction.Model;



import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private  String txnId;


    private String sender;
   
    private String receiver;

    private String fromCurrency;
    private String toCurrency;
    private Double amount;

    @Enumerated(EnumType.STRING)
    private TxnStatus txnStatus;

    @Enumerated(EnumType.STRING)
    private TransactionMethod transactionMethod; // NEW FIELD

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @CreationTimestamp
    private Date createdOn;

    @UpdateTimestamp
    private Date updatedOn;
}
