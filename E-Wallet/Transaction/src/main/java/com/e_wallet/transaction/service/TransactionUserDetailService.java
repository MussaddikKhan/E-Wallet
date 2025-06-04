package com.e_wallet.transaction.service;


import com.e_wallet.transaction.Model.TxnUser;
import com.e_wallet.transaction.dto.UserDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.simple.parser.JSONParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionUserDetailService implements UserDetailsService {
    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JSONParser jsonParser;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String url = "http://localhost:8082/user/get/" + username;
        UserDto userDto = restTemplate.getForObject(url, UserDto.class);
        if (userDto == null || userDto.getUsername() == null) {
            throw new UsernameNotFoundException("User not found");
        }
        List<GrantedAuthority> authorities = userDto.getAuthorityList().stream().map(e  -> new SimpleGrantedAuthority(e.getAuthority())).collect(Collectors.toList());

        return new TxnUser(userDto.getUsername(), userDto.getPassword(),authorities);
    }
}
