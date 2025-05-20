package com.e_wallet.transaction.dto;

import com.e_wallet.transaction.Model.TransactionMethod;
import com.e_wallet.transaction.Model.TxnStatus;
import lombok.Data;

@Data
public class TransactionDTO {

    private Sender sender;
    private Receiver receiver;

    private String fromCurrency;
    private String toCurrency;
    private Double amount;

    private TxnStatus txnStatus;
    private TransactionMethod transactionMethod; // NEW FIELD
}

