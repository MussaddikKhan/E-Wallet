package com.e_wallet.bank.controller;

import com.e_wallet.bank.dto.AddMoney;
import com.e_wallet.bank.service.BankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bank")
public class BankController {
    @Autowired
    private BankService bankService;

    @PutMapping("/add/money")
    public String updateBalance(@RequestBody AddMoney addMoney){
        return bankService.updateBalance(addMoney);
    }

    @GetMapping("/get/balance")
    public  Double getBalance(@RequestParam String phoneNumber){
        return  bankService.getBalance(phoneNumber);
    }
}
