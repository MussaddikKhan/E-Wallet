package com.e_wallet.transaction.dto;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Data
@Embeddable
public class Receiver {
    private  String countryCode;
    private  String phoneNumber;
}
