package com.e_wallet.wallet.service;

import com.e_wallet.wallet.model.UserCreatedEvent;
import com.e_wallet.wallet.model.Wallet;
import com.e_wallet.wallet.repository.WalletRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;


@Service
public class WalletService {
    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JSONParser jsonParser;

    @Autowired
    private KafkaTemplate<String , String> kafkaTemplate;         

    Logger logger = LoggerFactory.getLogger(WalletService.class);
    @KafkaListener(topics = "user-registration-topic", groupId = "user-wallet-group")
    public void createWallet(String msg){

        JSONObject event = null;
        try {
            event = (JSONObject) jsonParser.parse(msg);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }

        // Determine currency based on country code
        String countryCode = String.valueOf(event.get("countryCode"));
        String phoneNumber = String.valueOf(event.get("phoneNumber"));
        String userName = String.valueOf(event.get("userName"));
        String currency = switch (countryCode) {
            case "+91" -> "INR";
            case "+1" -> "USD";
            case "+44" -> "GBP";
            default -> "USD";  // Default to USD if country code is not recognized
        };

        // Create wallet
        Wallet wallet = new Wallet();
        wallet.setBalance(0.0);
        wallet.setCurrency(currency);
        wallet.setPhoneNumber(countryCode + "-" + phoneNumber);
        wallet.setUserName(userName);

        // Save to database
        walletRepository.save(wallet);

        // Log wallet creation
        logger.info("Wallet created successfully for Phone Number: {} with Currency: {} and Balance: {}",
                wallet.getPhoneNumber(), wallet.getCurrency(), wallet.getBalance());
    }

    // Bank - To- Wallet flow
    @KafkaListener(topics = "update-wallet-txn", groupId = "wallet-update-group")
    public void creditWalletBalance(String msg) {
        try {
            logger.info("Received message to credit wallet: {}", msg);

            // 1. Parse Kafka message
            JSONObject event = (JSONObject) jsonParser.parse(msg);
            JSONObject receiverObj = (JSONObject) event.get("receiver");

            String receiverFormattedPhone = receiverObj.get("countryCode") + "-" + receiverObj.get("phoneNumber");
            double amount = Double.parseDouble(event.get("amount").toString());
            String txnId = event.get("txnId").toString();

            // 2. Fetch receiver's wallet
            Wallet receiverWallet = walletRepository.findByPhoneNumber(receiverFormattedPhone);

            if (receiverWallet == null) {
                logger.warn("Wallet not found for receiver: {} | txnId: {}", receiverFormattedPhone, txnId);
                return; // optionally raise alert or handle in retry mechanism
            }

            // 3. Credit amount to wallet
            receiverWallet.setBalance(receiverWallet.getBalance() + amount);
            walletRepository.save(receiverWallet);
            // c. Optionally inform transaction history for receiver
            kafkaTemplate.send("update-txn-receiver", objectMapper.writeValueAsString(event));

            logger.info("Credited ₹{} to wallet of {} for txnId {}", amount, receiverFormattedPhone, txnId);

        } catch (Exception e) {
            logger.error("Exception while crediting wallet: {}", e.getMessage(), e);
            // optionally log to DLT or alert
        }
    }

    @KafkaListener(topics = "wallet-to-person", groupId = "wallet-to-person-group")
    public void performWalletToPersonTxn(String msg) {
        try {
            logger.info("Received Wallet to Person Txn Request: {}", msg);

            // 1. Parse Kafka message
            JSONObject event = (JSONObject) jsonParser.parse(msg);
            JSONObject senderObj = (JSONObject) event.get("sender");
            JSONObject receiverObj = (JSONObject) event.get("receiver");

            // 2. Determine receiver's currency based on country code
            String receiverCurrency = getCurrencyFromCountryCode(String.valueOf(receiverObj.get("countryCode")));
            String senderCurrency = getCurrencyFromCountryCode(String.valueOf(senderObj.get("countryCode")));

            // 3. Extract relevant fields
            String senderFormattedPhone = senderObj.get("countryCode") + "-" + senderObj.get("phoneNumber");
            double amountInReceiverCurrency = Double.parseDouble(event.get("amount").toString());
            String txnId = event.get("txnId").toString();

            // 4. Fetch sender's wallet (assumed to be in INR)
            Wallet senderWallet = walletRepository.findByPhoneNumber(senderFormattedPhone);

            if (senderWallet == null) {
                logger.warn("Sender Wallet not found: {}", senderFormattedPhone);
                event.put("txnStatus", "FAILED");
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
                return;
            }

            // 5. Convert receiver's amount into INR (since sender wallet is in INR)
            double amountInINR = convertToINR(amountInReceiverCurrency, receiverCurrency , senderCurrency);

            // 6. Validate sender's INR balance
            if (senderWallet.getBalance() < amountInINR) {
                double deficit = amountInINR - senderWallet.getBalance();
                logger.warn("Insufficient balance ₹{} for sender {} | txnId {}", deficit, senderFormattedPhone, txnId);
                event.put("txnStatus", "FAILED");
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
                return;
            }

            // 7. Deduct amount from sender's INR wallet
            senderWallet.setBalance(senderWallet.getBalance() - amountInINR);
            walletRepository.save(senderWallet);

            // 8. Update status and publish events
            event.put("txnStatus", "SUCCESSFUL");

            // a. Notify sender transaction success
            kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));

            // b. Notify receiver's bank service to credit their account
            kafkaTemplate.send("update-bank-txn", objectMapper.writeValueAsString(event));

            logger.info("Wallet to Person Txn {} processed successfully", txnId);

        } catch (Exception e) {
            logger.error("Exception in performWalletToPersonTxn: {}", e.getMessage(), e);
            // Handle parse failure
            try {
                JSONObject failedEvent = (JSONObject) jsonParser.parse(msg);
                failedEvent.put("txnStatus", "FAILED");
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(failedEvent));
            } catch (Exception ex) {
                logger.error("Also failed to handle failed event: {}", ex.getMessage());
            }
        }
    }

    public String getCurrencyFromCountryCode(String countryCode) {
        return switch (countryCode) {
            case "+91" -> "INR";
            case "+1" -> "USD";
            case "+44" -> "GBP";
            default -> "USD";  // Default currency if not recognized
        };
    }

    /**
     * Converts given amount in receiver's currency to INR.
     * Used to deduct INR balance from sender's wallet.
     */
    public Double convertToINR(Double amount, String receiverCurrency, String senderCurrency) {
        return 85.0; 
    }
//    public Double getAmntWithCurrency(String currency){
//
//        switch (currency.toUpperCase()) {
//            case "USD":
//                return  85.0; // USD to INR
//            case "GBP":
//                return  105.0; // GBP to INR
//            case "INR":
//                return 1.0;         // INR to INR
//            default:
//                return 85;
//        }
//    }

    public Double getBalance(String phoneNumber) {
        Wallet wallet =  walletRepository.findByPhoneNumber(phoneNumber);
        return wallet.getBalance();
    }
}
