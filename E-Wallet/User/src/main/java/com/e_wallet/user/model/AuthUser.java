package com.e_wallet.user.model;

import lombok.*;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUser {
    public String username;
    public String password;
    public List<GrantedAuthority> authorityList;
}
