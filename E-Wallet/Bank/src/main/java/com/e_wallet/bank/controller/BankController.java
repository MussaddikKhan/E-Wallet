package com.e_wallet.bank.controller;

import com.e_wallet.bank.dto.AddMoney;
import com.e_wallet.bank.service.BankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bank")
@CrossOrigin(origins = "http://localhost:3000")
public class BankController {
    @Autowired
    private BankService bankService;

    @PutMapping("/add/money")
    public String updateBalance(@RequestBody AddMoney addMoney){

        return bankService.updateBalance(addMoney);
    }

    @GetMapping("/get/balance")
    public  Double getBalance(){
        String phoneNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        return  bankService.getBalance(phoneNumber);
    }
}
