package com.e_wallet.wallet.controller;

import com.e_wallet.wallet.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/wallet")
public class WalletController {
    @Autowired
    private WalletService walletService;


    @GetMapping("/view/balance")
    public  Double getBalance(){
        String phoneNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        return  walletService.getBalance(phoneNumber);
    }

}
