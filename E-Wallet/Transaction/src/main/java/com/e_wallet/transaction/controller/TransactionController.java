package com.e_wallet.transaction.controller;

import com.e_wallet.transaction.dto.TransactionDTO;
import com.e_wallet.transaction.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/transaction")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/initiate")
    private  String initiateTransaction(@RequestBody TransactionDTO transactionDTO) throws Exception {
        return transactionService.initiateTxn(transactionDTO);
    }

}
