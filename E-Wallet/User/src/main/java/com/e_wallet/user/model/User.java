package com.e_wallet.user.model;


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
public class User {
    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private  long  id;
    private  String name;
    @Column(unique = true, nullable = false)
    private  String userName;
    @Column(unique = true, nullable = false)
    private  String email;
    private  String countryCode;  // +91 , +1 ,
    private  String phoneNumber;
    @CreationTimestamp
    private Date createdOn;
    @UpdateTimestamp
    private  Date updatedOn;
}
