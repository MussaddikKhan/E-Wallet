package com.e_wallet.wallet.dto;

import com.e_wallet.wallet.model.WalletUser;
import lombok.*;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDto {
    private String username;
    private String password;
    private List<String> authorityList;


}
