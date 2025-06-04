package com.e_wallet.transaction.controller;


import com.e_wallet.transaction.Model.Transaction;
import com.e_wallet.transaction.dto.TransactionDTO;
import com.e_wallet.transaction.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transaction")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/initiate")
    private  String initiateTransaction(@RequestBody TransactionDTO transactionDTO) throws Exception {
        String sender = SecurityContextHolder.getContext().getAuthentication().getName();
        transactionDTO.setSender(sender);
        return transactionService.initiateTxn(transactionDTO);
    }
    @GetMapping("/get/all")
    private List<Transaction> getAll(){
        return transactionService.getAll();
    }
}
