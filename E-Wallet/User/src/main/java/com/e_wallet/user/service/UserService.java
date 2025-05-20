package com.e_wallet.user.service;

import com.e_wallet.user.model.User;
import com.e_wallet.user.model.UserCreatedEvent;
import com.e_wallet.user.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.simple.JSONObject ;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    private KafkaTemplate<String , String> kafkaTemplate;
    public User createUser(User user) {
        UserCreatedEvent userCreatedEvent = new UserCreatedEvent();
        userCreatedEvent.setUserName(user.getUserName());
        userCreatedEvent.setPhoneNumber(user.getPhoneNumber());
        userCreatedEvent.setCountryCode(user.getCountryCode());
        JSONObject event =   objectMapper.convertValue(userCreatedEvent, JSONObject.class);
        String msg = null;
        try {
            msg = objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        kafkaTemplate.send("user-registration-topic", user.getPhoneNumber(),
               msg);
        return  userRepository.save(user); 
    }
}
