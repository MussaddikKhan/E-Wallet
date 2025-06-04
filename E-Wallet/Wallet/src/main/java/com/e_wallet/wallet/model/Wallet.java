package com.e_wallet.wallet.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {
    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private  long id;
    private  String userName;
    
    @Column(unique = true)
    private  String phoneNumber;
    
    private  String currency;
    private  Double balance;
    @CreationTimestamp
    private Date createdOn;
    @UpdateTimestamp
    private  Date updatedOn;
}
