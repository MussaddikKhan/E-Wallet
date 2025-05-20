package com.e_wallet.transaction.Model;


import com.e_wallet.transaction.dto.Receiver;
import com.e_wallet.transaction.dto.Sender;
import jakarta.persistence.*;

import lombok.Builder;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Entity
@Data
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private  String txnId;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "countryCode", column = @Column(name = "sender_country_code")),
            @AttributeOverride(name = "phoneNumber", column = @Column(name = "sender_phone_number"))
    })
    private Sender sender;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "countryCode", column = @Column(name = "receiver_country_code")),
            @AttributeOverride(name = "phoneNumber", column = @Column(name = "receiver_phone_number"))
    })
    private Receiver receiver;

    private String fromCurrency;
    private String toCurrency;
    private Double amount;

    @Enumerated(EnumType.STRING)
    private TxnStatus txnStatus;

    @Enumerated(EnumType.STRING)
    private TransactionMethod transactionMethod; // NEW FIELD

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @CreationTimestamp
    private Date createdOn;

    @UpdateTimestamp
    private Date updatedOn;
}
