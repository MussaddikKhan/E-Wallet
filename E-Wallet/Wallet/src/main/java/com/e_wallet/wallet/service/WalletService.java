package com.e_wallet.wallet.service;

import com.e_wallet.wallet.model.Wallet;
import com.e_wallet.wallet.repository.WalletRepository;
import com.e_wallet.wallet.util.PhoneCurrencyUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


@Service
public class WalletService {
    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JSONParser jsonParser;

    @Value("${currency.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    Logger logger = LoggerFactory.getLogger(WalletService.class);

    @KafkaListener(topics = "user-registration-topic", groupId = "user-wallet-group")
    public void createWallet(String msg) {

        JSONObject event = null;
        try {
            event = (JSONObject) jsonParser.parse(msg);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }

        // Determine currency based on country code
        String countryCode = String.valueOf(event.get("phoneNumber")).split("-")[0];
        String phoneNumber = String.valueOf(event.get("phoneNumber"));
        String userName = String.valueOf(event.get("userName"));
        String currency =  PhoneCurrencyUtil.getCurrency(countryCode);

        // Create wallet
        Wallet wallet = new Wallet();
        wallet.setBalance(0.0);
        wallet.setCurrency(currency);
        wallet.setPhoneNumber(phoneNumber);
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
            String receiver = event.get("receiver").toString();


            double amount = Double.parseDouble(event.get("amount").toString());
            String txnId = event.get("txnId").toString();

            // 2. Fetch receiver's wallet
            Wallet receiverWallet = walletRepository.findByPhoneNumber(receiver);

            if (receiverWallet == null) {
                event.put("message", "Receiver Wallet Not Found");
                event.put("txnStatus", "FAILED");
                logger.warn("Wallet not found for receiver: {} | txnId: {}", receiver, txnId);
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
                return; // optionally raise alert or handle in retry mechanism
            }

            // 3. Credit amount to wallet
            receiverWallet.setBalance(receiverWallet.getBalance() + amount);
            walletRepository.save(receiverWallet);
            event.put("message", "Transaction Successful");
            event.put("txnStatus", "SUCCESSFUL");
            // c. Optionally inform transaction history for receiver
            kafkaTemplate.send("update-txn-receiver", objectMapper.writeValueAsString(event));

            logger.info("Credited ₹{} to wallet of {} for txnId {}", amount, receiver, txnId);

        } catch (Exception e) {
            logger.error("Exception while crediting wallet: {}", e.getMessage(), e);
            // optionally log to DLT or alert
        }
    }

    @KafkaListener(topics = "wallet-to-person", groupId = "wallet-to-person-group")
    public void performWalletToPersonTxn(String msg) {
        JSONObject event = null;
        try {
            logger.info("Received Wallet to Person Txn Request: {}", msg);
             event = (JSONObject) jsonParser.parse(msg);
            // 1. Parse Kafka message
            String sender = event.get("sender").toString();
            String receiver = event.get("receiver").toString();

            // 2. Determine receiver's currency based on country code
            String receiverCurrency = PhoneCurrencyUtil.getCurrency(receiver.split("-")[0]);
            String senderCurrency = PhoneCurrencyUtil.getCurrency(sender.split("-")[0]);

            // 3. Extract relevant fields
            double amountInReceiverCurrency = Double.parseDouble(event.get("amount").toString());
            String txnId = event.get("txnId").toString();

            // 4. Fetch sender's wallet (assumed to be in INR)
            Wallet senderWallet = walletRepository.findByPhoneNumber(sender);

            if (senderWallet == null) {
                logger.warn("Sender Wallet not found ");
                event.put("txnStatus", "FAILED");
                event.put("message", "Sender Wallet not found ");
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
                return;
            }

            // 5. Convert receiver's amount into sender
            double amountInINR = convertCurrency(amountInReceiverCurrency, receiverCurrency, senderCurrency);

            // 6. Validate sender's INR balance
            if (senderWallet.getBalance() < amountInINR) {
                double deficit = amountInINR - senderWallet.getBalance();
                logger.warn("Insufficient b" +
                        "Balance Rs {} for sender {} | txnId {}", deficit, sender, txnId);
                String value = "Insufficient Balance";
                event.put("txnStatus", "FAILED");
                event.put("message", value);
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
                return;
            }

            // 7. Deduct amount from sender's INR wallet
            senderWallet.setBalance(senderWallet.getBalance() - amountInINR);
            walletRepository.save(senderWallet);

            // 8. Update status and publish events
            event.put("txnStatus", "SUCCESSFUL");
            event.put("message", "Transaction Successful");

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
                event.put("message", "Transaction Failed Due To some Internal Error");
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(failedEvent));
            } catch (Exception ex) {
                logger.error("Also failed to handle failed event: {}", ex.getMessage());
            }
        }
    }


    public double convertCurrency(double amount, String fromCurrency, String toCurrency) {
        try {
            String url = "https://v6.exchangerate-api.com/v6/" + apiKey + "/pair/" + fromCurrency + "/" + toCurrency;

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JSONObject json = (JSONObject) new JSONParser().parse(response.getBody());

                if ("success".equalsIgnoreCase((String) json.get("result"))) {
                    double rate = Double.parseDouble(json.get("conversion_rate").toString());
                    return amount * rate;
                } else {
                    throw new RuntimeException("Currency API returned failure: " + json.get("error-type"));
                }
            } else {
                throw new RuntimeException("Failed to fetch exchange rate from API.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Currency conversion failed: " + e.getMessage());
        }

    }

    @KafkaListener(topics = "update-wallet-amount", groupId = "wallet-update-group")
    public  void updateAmount(String msg) throws ParseException {
        JSONObject event = (JSONObject) jsonParser.parse(msg);
        String sender = event.get("sender").toString();
        Wallet wallet = walletRepository.findByPhoneNumber(sender);
        Double amount =Double.parseDouble(event.get("amount").toString());
        wallet.setBalance(wallet.getBalance() + amount);
        walletRepository.save(wallet); 
    }

    /**
     * Converts given amount in receiver's currency to INR.
     * Used to deduct INR balance from sender's wallet.
     */

    public Double getBalance(String phoneNumber) {
        Wallet wallet = walletRepository.findByPhoneNumber(phoneNumber);
        return wallet.getBalance();
    }

}
