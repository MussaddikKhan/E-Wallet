package com.e_wallet.user.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserCreatedEvent {

    private String countryCode;
    private String phoneNumber;
    private String userName;
}
