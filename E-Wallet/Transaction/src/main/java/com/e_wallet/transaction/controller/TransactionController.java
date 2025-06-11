package com.e_wallet.transaction.controller;


import com.e_wallet.transaction.Model.Transaction;
import com.e_wallet.transaction.dto.TransactionDTO;
import com.e_wallet.transaction.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transaction")
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {
    @Autowired
    private TransactionService transactionService;

    @PostMapping("/initiate")
    private ResponseEntity<String> initiateTransaction(@RequestBody TransactionDTO transactionDTO) throws Exception {
        String sender = SecurityContextHolder.getContext().getAuthentication().getName();
        transactionDTO.setSender(sender);
        return transactionService.initiateTxn(transactionDTO);
    }
    @GetMapping("/get/all")
    private List<Transaction> getAll(){
        return transactionService.getAll();
    }

    @GetMapping("/get")
    private List<Transaction> getTxn(){
        String sender = SecurityContextHolder.getContext().getAuthentication().getName();
        return transactionService.getTxn(sender);
    }
    @GetMapping("/get/msg")
    private ResponseEntity<Map<String, String>> getMessage(@RequestParam(required = true) String txnId){
        return transactionService.getMessage(txnId);
    }
}
