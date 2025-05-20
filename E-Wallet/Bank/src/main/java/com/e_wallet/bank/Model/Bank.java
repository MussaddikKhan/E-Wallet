package com.e_wallet.bank.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Bank {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;
    
    @Column(unique = true , nullable = false)
    private String phoneNumber;

    @Column(unique = true, nullable = false)
    private  String accountNumber;

    private  Double balance;
    private  String  currency;

}
