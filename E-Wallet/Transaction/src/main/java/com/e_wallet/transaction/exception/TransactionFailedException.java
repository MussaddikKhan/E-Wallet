package com.e_wallet.transaction.exception;

public class TransactionFailedException extends  RuntimeException{
    public TransactionFailedException(String message) {
        super(message);
    }
}
