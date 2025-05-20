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
import org.springframework.stereotype.Service;


@Service
public class WalletService {
    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JSONParser jsonParser;

    @KafkaListener(topics = "user-registration-topic", groupId = "user-wallet-group")
    public void createWallet(String msg){
        Logger logger = LoggerFactory.getLogger(WalletService.class);
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

    public Double getBalance(String phoneNumber) {
        Wallet wallet =  walletRepository.findByPhoneNumber(phoneNumber);
        return wallet.getBalance();
    }
}
