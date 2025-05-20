package com.e_wallet.transaction.service;


import com.e_wallet.transaction.Model.Transaction;
import com.e_wallet.transaction.Model.TransactionMethod;
import com.e_wallet.transaction.Model.TransactionType;
import com.e_wallet.transaction.Model.TxnStatus;
import com.e_wallet.transaction.dto.Receiver;
import com.e_wallet.transaction.dto.Sender;
import com.e_wallet.transaction.dto.TransactionDTO;
import com.e_wallet.transaction.repository.TransactionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

import static java.lang.String.*;

@Service
public class TransactionService {

    @Autowired
    private  TransactionRepository txnRepository;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private  JSONParser jsonParser;

    // Currency mapping based on country codes
    private String getCurrencyFromCountryCode(String countryCode) {
        if (countryCode.equals("+1")) {
            return "USD";
        } else if (countryCode.equals("+91")) {
            return "INR";
        } else if (countryCode.equals("+44")) {
            return "GBP";
        }
        return "USD"; // Default currency
    }

    public String initiateTxn(TransactionDTO transactionDTO) throws Exception {
        // Derive currencies from phone numbers
        String fromCurrency = getCurrencyFromCountryCode(transactionDTO.getSender().getCountryCode());
        String toCurrency = getCurrencyFromCountryCode(transactionDTO.getReceiver().getCountryCode());

        // Create the transaction
        Transaction transaction = Transaction.builder()
                .txnId(UUID.randomUUID().toString())
                .sender(transactionDTO.getSender())
                .receiver(transactionDTO.getReceiver())
                .amount(transactionDTO.getAmount())
                .transactionType(TransactionType.DEBIT)
                .fromCurrency(fromCurrency)
                .toCurrency(toCurrency)
                .transactionMethod(transactionDTO.getTransactionMethod())
                .txnStatus(TxnStatus.PENDING) // Always pending initially
                .build();

        // Save to database
        txnRepository.save(transaction);

        // Publish to Kafka
        JSONObject event = objectMapper.convertValue(transaction, JSONObject.class);
        if(transaction.getTransactionMethod().equals(TransactionMethod.BANK_TO_PERSON)) {
            kafkaTemplate.send("bank-to-person", objectMapper.writeValueAsString(event));
        }
        else if(transaction.getTransactionMethod().equals(TransactionMethod.BANK_TO_WALLET)){
            kafkaTemplate.send("bank-to-wallet", objectMapper.writeValueAsString(event));
        }
        else if(transaction.getTransactionMethod().equals(TransactionMethod.WALLET_TO_PERSON)) {
            kafkaTemplate.send("wallet-to-person", objectMapper.writeValueAsString(event));
        }
        return transaction.getTxnId();
    }

    @KafkaListener(topics = "update-txn-sender",groupId = "update-txn-group")
    public void updateTxnSender(String msg) throws ParseException {
       JSONObject event = (JSONObject) jsonParser.parse(msg);
       String externalTxnId = valueOf(event.get("txnId"));
       Transaction transaction = txnRepository.findByTxnId(externalTxnId);
        // Correct way to extract and set transaction status
        String txnStatusStr = event.get("txnStatus").toString();
         // Transaction Status -> not updating (Debit) 
        if (TxnStatus.valueOf(txnStatusStr) == TxnStatus.SUCCESSFUL) {
            transaction.setTxnStatus(TxnStatus.SUCCESSFUL);

        } else {
            transaction.setTxnStatus(TxnStatus.FAILED);
        }
        txnRepository.save(transaction);
    }
    
    @KafkaListener(topics = "update-txn-receiver",groupId = "update-txn-group")
    public void updateTxnReceiver(String msg) throws ParseException {
        JSONObject event = (JSONObject) jsonParser.parse(msg);
        Transaction receiverTxn = Transaction.builder()
                .txnId(UUID.randomUUID().toString()) // new txn ID for receiver
                .sender(objectMapper.convertValue(event.get("sender"), Sender.class)) //  nested object
                .receiver(objectMapper.convertValue(event.get("receiver"), Receiver.class))
                .amount(Double.parseDouble(event.get("amount").toString()))
                .transactionType(TransactionType.CREDIT)
                .fromCurrency(event.get("fromCurrency").toString())
                .toCurrency(event.get("toCurrency").toString())
                .transactionMethod(TransactionMethod.valueOf(event.get("transactionMethod").toString()))
                .txnStatus(TxnStatus.SUCCESSFUL)
                .build();

        txnRepository.save(receiverTxn);
    }
}
