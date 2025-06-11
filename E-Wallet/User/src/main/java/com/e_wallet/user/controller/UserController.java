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

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
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
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest user) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );

            UserDetails userDetails = userService.loadUserByUsername(user.getUsername());
            String jwt = jwtUtil.generateToken(userDetails.getUsername());

            // Create response map
            Map<String, String> response = new HashMap<>();
            response.put("token", jwt);
            response.put("message", "Login successful");

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Exception occurred while creating authentication token", e);

            // Error response map
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Incorrect username or password");

            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }





    }

    // TODO : Frontend also using same api which you have to update with userDto Object 
    @GetMapping("/get/{phoneNumber}")
    public ResponseEntity<AuthUser> get(@PathVariable String phoneNumber){
        return userService.getUser(phoneNumber);
    }
}
