package com.e_wallet.user.controller;

import com.e_wallet.user.model.AuthUser;
import com.e_wallet.user.model.LoginRequest;
import com.e_wallet.user.model.User;
import com.e_wallet.user.service.UserService;
import com.e_wallet.user.jwtConfig.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@Slf4j
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private  AuthenticationManager authenticationManager;

    @PostMapping("/signup")
    public void signup(@RequestBody User user){
         userService.createUser(user);
    }
    @GetMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest user){
        try{
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));
            UserDetails userDetails = userService.loadUserByUsername(user.getUsername());
            String jwt = jwtUtil.generateToken(userDetails.getUsername());
            return new ResponseEntity<>(jwt, HttpStatus.OK);
        }catch (Exception e){
            log.error("Exception occurred while createAuthenticationToken ", e);
            return new ResponseEntity<>("Incorrect username or password", HttpStatus.BAD_REQUEST);
        }
    }

    // TODO : Frontend also using same api which you have to update with userDto Object 
    @GetMapping("/get/{phoneNumber}")
    public ResponseEntity<AuthUser> get(@PathVariable String phoneNumber){
        return userService.getUser(phoneNumber);
    }
}
