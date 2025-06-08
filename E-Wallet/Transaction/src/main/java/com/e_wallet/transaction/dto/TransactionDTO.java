package com.e_wallet.transaction.dto;

import com.e_wallet.transaction.Model.TransactionMethod;
import com.e_wallet.transaction.Model.TxnStatus;
import lombok.Data;

@Data
public class TransactionDTO {
    private String sender;
    private String receiver;
    private Double amount;
    private TransactionMethod transactionMethod; // NEW FIELD
}

