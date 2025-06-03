package com.e_wallet.user.service;

import com.e_wallet.user.jwtConfig.PasswordEncoderConfig;
import com.e_wallet.user.model.AuthUser;
import com.e_wallet.user.model.User;
import com.e_wallet.user.model.UserCreatedEvent;
import com.e_wallet.user.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.simple.JSONObject ;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Value("${user.authorities}")
    private String defaultAuthority;

    @Autowired
    PasswordEncoderConfig passwordEncoderConfig;
    public void createUser(User user) {
        // ✅ Set default ROLE from config
        user.setAuthorities(defaultAuthority);
        user.setPassword(new BCryptPasswordEncoder().encode(user.getPassword()));
        

        // ✅ Create Kafka event
        UserCreatedEvent userCreatedEvent = new UserCreatedEvent();
        userCreatedEvent.setUserName(user.getName());
        userCreatedEvent.setPhoneNumber(user.getPhoneNumber());

        JSONObject event = objectMapper.convertValue(userCreatedEvent, JSONObject.class);
        String msg;
        try {
            msg = objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        // ✅ Send to Kafka
        kafkaTemplate.send("user-registration-topic", user.getPhoneNumber(), msg);

        // ✅ Save to DB
         userRepository.save(user);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByPhoneNumber(username);
    }

    public ResponseEntity<AuthUser> getUser(String phoneNumber) {
        User user =  (User)userRepository.findByPhoneNumber(phoneNumber);
        if(user==null)return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(user.to(user), HttpStatus.OK);
    }
}
