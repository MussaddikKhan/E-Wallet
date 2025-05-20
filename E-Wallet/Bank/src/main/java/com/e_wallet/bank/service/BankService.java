package com.e_wallet.bank.service;

import com.e_wallet.bank.Model.Bank;
import com.e_wallet.bank.dto.AddMoney;
import com.e_wallet.bank.repository.BankRepository;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
public class BankService {
    @Autowired
    private BankRepository bankRepository;

    @Autowired
    private JSONParser jsonParser;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    // Create A bank Account
    @KafkaListener(topics = "user-registration-topic", groupId = "user-bank-group")
    public void createAccount(String msg) {

        Logger logger = LoggerFactory.getLogger(BankService.class);
        JSONObject event = null;
        try {
            event = (JSONObject) jsonParser.parse(msg);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        // Determine currency based on country code
        String countryCode = String.valueOf(event.get("countryCode"));
        String phoneNumber = String.valueOf(event.get("phoneNumber"));
        String currency = switch (countryCode) {
            case "+91" -> "INR";
            case "+1" -> "USD";
            case "+44" -> "GBP";
            default -> "USD";  // Default to USD if country code is not recognized
        };
        // Create bank account
        Bank bank = new Bank();
        bank.setAccountNumber(UUID.randomUUID().toString());
        bank.setCurrency(currency);
        bank.setPhoneNumber(countryCode + "-" + phoneNumber);
        bank.setBalance(100.0);  // Set initial balance (assuming 100 units as per your plan)

        // Save bank account
        bankRepository.save(bank);

        logger.info("Bank Account Created Successfully with Currency: {} and Balance: {}", bank.getCurrency(), bank.getBalance());
    }

    // Payment via Bank - to - Bank
    @KafkaListener(topics = "bank-to-person", groupId = "bank-to-person-group")
    public void performTransaction(String msg) {
        try {
            // 1. Parse transaction
            JSONObject event = (JSONObject) jsonParser.parse(msg);

            JSONObject senderObj = (JSONObject) event.get("sender");
            JSONObject receiverObj = (JSONObject) event.get("receiver");

            // 1. Extract details from JSON
            String sCountryCode = senderObj.get("countryCode").toString();     // Sender Country Code
            String rCountryCode = receiverObj.get("countryCode").toString();   // Receiver Country Code

            String senderPhone = senderObj.get("phoneNumber").toString();    // Sender Phone Number
            String receiverPhone = receiverObj.get("phoneNumber").toString();  // Receiver Phone Number

            double amount = Double.parseDouble(event.get("amount").toString()); // Transaction amount
            String txnId = event.get("txnId").toString();                      // Transaction ID

            // 2. Format phone numbers for DB lookup
            String senderFormattedPhone = sCountryCode + "-" + senderPhone;
            String receiverFormattedPhone = rCountryCode + "-" + receiverPhone;

            // 3. Fetch bank accounts from DB using formatted phone numbers
            Bank senderBank = bankRepository.findByPhoneNumber(senderFormattedPhone);
            Bank receiverBank = bankRepository.findByPhoneNumber(receiverFormattedPhone);

            // 4. Validation
            if (senderBank == null || receiverBank == null) {
                log.warn("Sender or Receiver Bank not found. Failing transaction: {}", txnId);
                event.put("txnStatus", "FAILED");
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
                return;
            }

            if (senderBank.getBalance() < amount) {
                log.warn("Insufficient balance for sender: {} | txnId: {}", senderBank.getPhoneNumber(), txnId);
                event.put("txnStatus", "FAILED");
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
                return;
            }

            // 5. Perform transaction
            senderBank.setBalance(senderBank.getBalance() - amount);
            receiverBank.setBalance(receiverBank.getBalance() + amount);

            // 6. Save updates
            bankRepository.save(senderBank);
            bankRepository.save(receiverBank);

            // 7. Send SUCCESS status to both
            event.put("txnStatus", "SUCCESSFUL");

            kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
            kafkaTemplate.send("update-txn-receiver", objectMapper.writeValueAsString(event));

            log.info("Transaction {} completed successfully between {} and {}", txnId, senderFormattedPhone, receiverFormattedPhone);

        } catch (Exception e) {
            log.error("Error processing transaction: {}", e.getMessage());
            // Optional: Send FAILED update to sender for safety
        }
    }

    public String updateBalance(AddMoney addMoney) {
        Bank bank = bankRepository.findByAccountNumber(addMoney.getAccountNumber());
        if (bank == null) {
            return "Account is not available with this account Number";
        }
        bank.setBalance(bank.getBalance() + addMoney.getBalance());
        bankRepository.save(bank);
        return "Money Successfully Added to the Account total balance is = " + bank.getBalance();
    }

    /*  GET BANK  BALACNCE */
    public Double getBalance(String phoneNumber) {
        Bank bank = bankRepository.findByPhoneNumber(phoneNumber);
        return bank.getBalance();
    }
}
