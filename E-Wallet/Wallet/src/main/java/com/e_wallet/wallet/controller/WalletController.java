package com.e_wallet.wallet.controller;

import com.e_wallet.wallet.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wallet")
@CrossOrigin(origins = "http://localhost:3000")
public class WalletController {
    @Autowired
    private WalletService walletService;


    @GetMapping("/view/balance")
    public  Double getBalance(){
        String phoneNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        return  walletService.getBalance(phoneNumber);
    }

}
