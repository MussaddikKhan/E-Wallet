package com.e_wallet.bank.service;

import com.e_wallet.bank.Model.Bank;
import com.e_wallet.bank.dto.AddMoney;
import com.e_wallet.bank.repository.BankRepository;

import com.e_wallet.bank.util.PhoneCurrencyUtil;
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

    Logger logger = LoggerFactory.getLogger(BankService.class);
    // Create A bank Account
    @KafkaListener(topics = "user-registration-topic", groupId = "user-bank-group")
    public void createAccount(String msg) {


        JSONObject event = null;
        try {
            event = (JSONObject) jsonParser.parse(msg);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        // Determine currency based on country code
        String countryCode = String.valueOf(event.get("phoneNumber")).split("-")[0];
        String phoneNumber = String.valueOf(event.get("phoneNumber"));
        String currency = PhoneCurrencyUtil.getCurrency(countryCode);
        // Create bank account
        Bank bank = new Bank();
        bank.setAccountNumber(UUID.randomUUID().toString());
        bank.setCurrency(currency);
        bank.setPhoneNumber(phoneNumber);
        bank.setBalance(100.0);  // Set initial balance (assuming 100 units as per your plan)

        // Save bank account
        bankRepository.save(bank);

        logger.info("Bank Account Created Successfully with Currency: {} and Balance: {}", bank.getCurrency(), bank.getBalance());
    }

    // Payment via Bank - to - Bank
    @KafkaListener(topics = "bank-to-person", groupId = "bank-to-person-group")
    public void performBankToBankTxn(String msg) {
        try {
            // 1. Parse transaction
            JSONObject event = (JSONObject) jsonParser.parse(msg);

            String sender =     event.get("sender").toString();
            String receiver =   event.get("receiver").toString();

            // 1. Extract details from JSON
            String sCountryCode = sender.split("-")[0];     // Sender Country Code
            String rCountryCode = receiver.split("-")[0];   // Receiver Country Code
            if(!sCountryCode.equals(rCountryCode)){
                log.warn("You Can't Make International Payment Through Bank ");
                event.put("txnStatus", "FAILED");
                event.put("message","You Can't Make International Payment Through Bank");
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
                return;
            }


            double amount = Double.parseDouble(event.get("amount").toString()); // Transaction amount
            String txnId = event.get("txnId").toString();                      // Transaction ID




            // 3. Fetch bank accounts from DB using formatted phone numbers
            Bank senderBank = bankRepository.findByPhoneNumber(sender);
            Bank receiverBank = bankRepository.findByPhoneNumber(receiver);

            // 4. Validation
            if (senderBank == null || receiverBank == null) {
                log.warn("Sender or Receiver Bank not found. Failing transaction: {}", txnId);
                event.put("txnStatus", "FAILED");
                event.put("Message", "Receiver Bank not found");

                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
                return;
            }

            if (senderBank.getBalance() < amount) {
                double deficit = amount - senderBank.getBalance();
                log.warn("Insufficient balance for sender: {} | txnId: {}", senderBank.getPhoneNumber(), txnId);
                event.put("txnStatus", "FAILED");
                String value = "Insufficient Balance";
                event.put("message",value);
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
            event.put("message", "Transaction Successful");
            kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
            kafkaTemplate.send("update-txn-receiver", objectMapper.writeValueAsString(event));

            log.info("Transaction {} completed successfully between {} and {}", txnId, sender, receiver);

        } catch (Exception e) {
            log.error("Error processing transaction: {}", e.getMessage());
            // Optional: Send FAILED update to sender for safety
        }
    }

    @KafkaListener(topics = "bank-to-wallet", groupId = "bank-to-person-group")
    public void performBankToWalletTxn(String msg) {
        try {
            log.info("Received Bank to Wallet Txn Request: {}", msg);

            // 1. Parse Kafka message
            JSONObject event = (JSONObject) jsonParser.parse(msg);
            String  sender = event.get("sender").toString();
            String  receiver  = event.get("receiver").toString();


            double amount = Double.parseDouble(event.get("amount").toString());
            String txnId = event.get("txnId").toString();

            // 3. Fetch sender's bank account
            Bank senderBank = bankRepository.findByPhoneNumber(sender);

            if (senderBank == null) {
                log.warn("Sender bank not found: {}", sender);
                event.put("txnStatus", "FAILED");
                event.put("message", "Sender bank not found ");
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
                return;
            }
            String sCountryCode = sender.split("-")[0];     // Sender Country Code
            String rCountryCode = receiver.split("-")[0];
            if(!sCountryCode.equals(rCountryCode))   {
                log.warn(" You Can't Make International Payment Through Bank ");
                event.put("txnStatus", "FAILED");
                event.put("message","You Can't Make International Payment Through Bank");
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
                return;
            }
            // 4. Validate balance
            if (senderBank.getBalance() < amount) {
                double deficit = amount - senderBank.getBalance();
                log.warn("Insufficient balance for sender {} | txnId {}", sender, txnId);
                String value = "Insufficient Balance";
                event.put("txnStatus", "FAILED");
                event.put("message", value); 
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
                return;
            }

            // 5. Deduct amount from sender's bank
            senderBank.setBalance(senderBank.getBalance() - amount);
            bankRepository.save(senderBank);

            // 6. Add success status and send events to all
            event.put("txnStatus", "SUCCESSFUL");
            event.put("message", "Transaction Successful") ;

            // a. Update transaction status for sender
            kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));

            // b. Inform receiver's wallet service to credit amount
            kafkaTemplate.send("update-wallet-txn", objectMapper.writeValueAsString(event));


            log.info("Bank to Wallet Txn {} processed successfully", txnId);

        } catch (Exception e) {
            log.error("Exception in performBankToWalletTxn: {}", e.getMessage(), e);
            // Optionally mark as failed if parsing fails
            try {
                JSONObject failedEvent = (JSONObject) jsonParser.parse(msg);
                failedEvent.put("txnStatus", "FAILED");
                failedEvent.put("message", "Transaction Fail Due to some internal Issue");
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(failedEvent));
            } catch (Exception ex) {
                log.error("Also failed to handle failed event: {}", ex.getMessage());
            }
        }
    }

    @KafkaListener(topics = "update-bank-txn", groupId = "bank-to-person-group")
    public void performWalletToBankTxn(String msg) {
        try {
            logger.info("Received message to credit Bank: {}", msg);

            // 1. Parse Kafka message
            JSONObject event = (JSONObject) jsonParser.parse(msg);

            String  receiver = event.get("receiver").toString();

            // 2. Extract required fields

            double amount = Double.parseDouble(event.get("amount").toString());
            String txnId = event.get("txnId").toString();

            // 3. Fetch receiver's bank account using formatted phone number
            Bank receiverBank = bankRepository.findByPhoneNumber(receiver);

            if (receiverBank == null) {
                logger.warn("Receiver's Bank not found: {} | txnId: {}", receiver, txnId);
                // Optionally: send failed status to a topic or retry later
                event.put("message", "Receiver's Bank not found !");
                kafkaTemplate.send("update-txn-sender", objectMapper.writeValueAsString(event));
                return;
            }

            // 4. Credit the amount to receiver's bank balance
            receiverBank.setBalance(receiverBank.getBalance() + amount);
            bankRepository.save(receiverBank);

            // 5. Notify receiver's transaction status update (optional but recommended for tracking)
            kafkaTemplate.send("update-txn-receiver", objectMapper.writeValueAsString(event));

            logger.info("Credited ₹{} to Bank account of {} | txnId {}", amount, receiver, txnId);

        } catch (Exception e) {
            logger.error("Exception while crediting Bank account: {}", e.getMessage(), e);
            // Optionally: send event to Dead Letter Topic (DLT) or raise alert for manual investigation
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

    
    @KafkaListener(topics = "update-bank-amount", groupId = "bank-update-amount-group")
    public  void updateAmount(String msg) throws ParseException {
        logger.info("Bank amount updated ");
        JSONObject event = (JSONObject) jsonParser.parse(msg);
        String sender = event.get("sender").toString();
        Bank bank = bankRepository.findByPhoneNumber(sender);
        Double amount = Double.parseDouble(event.get("amount").toString());
        bank.setBalance(bank.getBalance() + amount);
        logger.info("Bank amount updated " + bank) ; 
        bankRepository.save(bank);
    }

    /*  GET BANK  BALACNCE */
    public Double getBalance(String phoneNumber) {
        Bank bank = bankRepository.findByPhoneNumber(phoneNumber);
        return bank.getBalance();
    }
}
