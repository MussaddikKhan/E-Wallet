package com.e_wallet.transaction.service;


import com.e_wallet.transaction.Model.Transaction;
import com.e_wallet.transaction.Model.TransactionMethod;
import com.e_wallet.transaction.Model.TransactionType;
import com.e_wallet.transaction.Model.TxnStatus;

import com.e_wallet.transaction.dto.TransactionDTO;
import com.e_wallet.transaction.repository.TransactionRepository;
import com.e_wallet.transaction.util.PhoneCurrencyUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository txnRepository;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JSONParser jsonParser;

    Logger logger = LoggerFactory.getLogger(TransactionService.class);

    // Currency mapping based on country codes


    public ResponseEntity<String> initiateTxn(TransactionDTO transactionDTO) throws Exception {
        // Derive currencies from phone numbers

        String fromCurrency = PhoneCurrencyUtil.getCurrency(transactionDTO.getSender().split("-")[0]);
        String toCurrency = PhoneCurrencyUtil.getCurrency(transactionDTO.getReceiver().split("-")[0]);

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
        if (transaction.getTransactionMethod().equals(TransactionMethod.BANK_TO_PERSON)) {
            kafkaTemplate.send("bank-to-person", objectMapper.writeValueAsString(event));
        } else if (transaction.getTransactionMethod().equals(TransactionMethod.BANK_TO_WALLET)) {
            kafkaTemplate.send("bank-to-wallet", objectMapper.writeValueAsString(event));
        } else if (transaction.getTransactionMethod().equals(TransactionMethod.WALLET_TO_PERSON)) {
            kafkaTemplate.send("wallet-to-person", objectMapper.writeValueAsString(event));
        }
        if(transaction.getTxnStatus().equals(TxnStatus.FAILED)){

            // If the is response then just say status is failed  handle it later with proper MSG
            return new ResponseEntity<>(transaction.getTxnId(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
        return new ResponseEntity<>(transaction.getTxnId(), HttpStatus.OK);
    }
    // Bank - to - wallet (inter national txn ) * fix 

    @KafkaListener(topics = "update-txn-sender", groupId = "update-txn-group")
    @Transactional
    public void updateTxnSender(String msg) {
        try {
            logger.info("Received Kafka message: {}", msg);

            JSONObject event = (JSONObject) jsonParser.parse(msg);
            String externalTxnId = String.valueOf(event.get("txnId"));
            Transaction transaction = txnRepository.findByTxnId(externalTxnId);

            if (transaction == null) {
                logger.error("Transaction not found for txnId: {}", externalTxnId);
                return;
            }

            String txnStatusStr = String.valueOf(event.get("txnStatus"));

            try {
                TxnStatus status = TxnStatus.valueOf(txnStatusStr.toUpperCase());
                transaction.setTxnStatus(status);
            } catch (IllegalArgumentException e) {
                transaction.setTxnStatus(TxnStatus.FAILED);
                logger.warn("Invalid txnStatus received: {}", txnStatusStr);
            }

            txnRepository.save(transaction);
            logger.info("Updated transaction {} with status {}", externalTxnId, transaction.getTxnStatus());

        } catch (ParseException e) {
            logger.error("Failed to parse Kafka message: {}", msg, e);
        } catch (Exception e) {
            logger.error("Unexpected error while processing Kafka message: {}", msg, e);
        }
    }

    @KafkaListener(topics = "update-txn-receiver", groupId = "update-txn-group")
    public void updateTxnReceiver(String msg) throws ParseException {
        JSONObject event = (JSONObject) jsonParser.parse(msg);
        Transaction receiverTxn = Transaction.builder()
                .txnId(UUID.randomUUID().toString()) // new txn ID for receiver
                .sender(event.get("sender").toString()) //  nested object
                .receiver(event.get("receiver").toString())
                .amount(Double.parseDouble(event.get("amount").toString()))
                .transactionType(TransactionType.CREDIT)
                .fromCurrency(event.get("fromCurrency").toString())
                .toCurrency(event.get("toCurrency").toString())
                .transactionMethod(TransactionMethod.valueOf(event.get("transactionMethod").toString()))
                .txnStatus(TxnStatus.SUCCESSFUL)
                .build();

        txnRepository.save(receiverTxn);
    }


    public List<Transaction> getAll() {
        return txnRepository.findAll();
    }

    public List<Transaction> getTxn(String sender) {
        return txnRepository.findBySenderOrReceiver(sender, sender);
    }
}
