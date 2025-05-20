package com.e_wallet.wallet.controller;

import com.e_wallet.wallet.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/wallet")
public class WalletController {
    @Autowired
    private WalletService walletService;


    @GetMapping("/get/balance")
    public  Double getBalance(@RequestParam String phoneNumber){
        return  walletService.getBalance(phoneNumber);
    }

}
