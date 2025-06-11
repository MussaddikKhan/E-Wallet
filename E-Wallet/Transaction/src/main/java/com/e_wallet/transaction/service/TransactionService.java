package com.e_wallet.transaction.service;


import com.e_wallet.transaction.Model.Transaction;
import com.e_wallet.transaction.Model.TransactionMethod;
import com.e_wallet.transaction.Model.TransactionType;
import com.e_wallet.transaction.Model.TxnStatus;

import com.e_wallet.transaction.dto.TransactionDTO;
import com.e_wallet.transaction.repository.TransactionRepository;
import com.e_wallet.transaction.util.PhoneCurrencyUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.observation.GlobalObservationConvention;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
        String id = UUID.randomUUID().toString();
        Transaction transaction = Transaction.builder()
                .txnId(id)
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

        transaction = txnRepository.findByTxnId(id);

        if (transaction.getTxnStatus().equals(TxnStatus.FAILED)) {
            return new ResponseEntity<>(transaction.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
        logger.info(id, transaction.getMessage());

        return new ResponseEntity<>(id, HttpStatus.OK);
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
                String message = String.valueOf(event.get("message"));
                transaction.setMessage(message);
                logger.info(transaction.getMessage(), "Message Update ho raha hai ? ");

            } catch (IllegalArgumentException e) {
                transaction.setTxnStatus(TxnStatus.FAILED);
                String message = String.valueOf(event.getOrDefault("message", "No details"));
                transaction.setMessage(message);
                logger.warn("Invalid txnStatus received: {}", txnStatusStr);
            }
            if (transaction.getTxnStatus().equals(TxnStatus.FAILED)) {
                logger.info("Transactiion is Failed and " + transaction.getTransactionMethod());
                if(!transaction.getMessage().equals("Receiver Wallet Not Found") && !transaction.getMessage().equals("Receiver's Bank not found !"))   {
                    txnRepository.save(transaction);
                    return;
                }
                else if (transaction.getTransactionMethod().equals(TransactionMethod.WALLET_TO_PERSON))
                    kafkaTemplate.send("update-wallet-amount", objectMapper.writeValueAsString(transaction));
                else
                {
                    logger.info("Enter to the bank transction ");
                    kafkaTemplate.send("update-bank-amount", objectMapper.writeValueAsString(transaction));
                }

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
                .message(event.get("message").toString())
                .txnStatus(TxnStatus.SUCCESSFUL)
                .build();

        txnRepository.save(receiverTxn);
    }


    public List<Transaction> getAll() {
        return txnRepository.findAll();
    }

    public List<Transaction> getTxn(String sender) {
        return txnRepository.findTxnWithStatus(sender, TransactionType.DEBIT, TransactionType.CREDIT);
    }

    public ResponseEntity<Map<String, String>> getMessage(String txnId) {
        Transaction transaction = txnRepository.findByTxnId(txnId);
        Map<String, String> mp = new HashMap<>();
        mp.put("status", String.valueOf(transaction.getTxnStatus()));
        mp.put("msg", transaction.getMessage());
        return new ResponseEntity<>(mp, HttpStatus.OK);
    }
}
