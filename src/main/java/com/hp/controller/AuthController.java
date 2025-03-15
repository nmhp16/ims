package com.hp.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hp.entity.User;
import com.hp.repository.UserRepository;
import com.hp.util.JwtUtil;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // http://localhost:8080/auth/login
    // Login
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest request) {
        try {
            logger.info("Attempting login for user: {}", request.getUsername());
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
            String token = jwtUtil.generateToken(request.getUsername());
            logger.info("Login successful for user: {}", request.getUsername());
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (Exception e) {
            logger.error("Login failed for user: {}", request.getUsername(), e);
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid credentials"));
        }
    }

    // http://localhost:8080/auth/register
    // Register
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest request) {
        try {
            logger.info("Attempting to register user: {}", request);

            // Validate request
            if (request == null) {
                logger.warn("Registration failed: request body is null");
                return ResponseEntity.badRequest().body(new ErrorResponse("Request body cannot be null"));
            }

            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                logger.warn("Registration failed: username is null or empty");
                return ResponseEntity.badRequest().body(new ErrorResponse("Username is required"));
            }

            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                logger.warn("Registration failed: password is null or empty");
                return ResponseEntity.badRequest().body(new ErrorResponse("Password is required"));
            }

            // Check if username exists
            if (userRepository.existsByUsername(request.getUsername())) {
                logger.warn("Registration failed: username already exists: {}", request.getUsername());
                return ResponseEntity.badRequest().body(new ErrorResponse("Username already exists"));
            }

            // Create new user
            User user = new User();
            user.setUsername(request.getUsername().trim());
            String encodedPassword = passwordEncoder.encode(request.getPassword());
            user.setPassword(encodedPassword);

            logger.debug("Saving user to database: {}", request.getUsername());
            try {
                userRepository.save(user);
            } catch (Exception e) {
                logger.error("Failed to save user to database", e);
                return ResponseEntity.internalServerError()
                        .body(new ErrorResponse("Failed to save user: " + e.getMessage()));
            }

            logger.info("Successfully registered user: {}", request.getUsername());
            return ResponseEntity.ok(new SuccessResponse("User registered successfully"));
        } catch (Exception e) {
            logger.error("Registration failed", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Registration failed: " + e.getMessage()));
        }
    }
}

class AuthRequest {
    private String username;
    private String password;

    // Default constructor for JSON deserialization
    public AuthRequest() {
    }

    // Constructor with parameters
    public AuthRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "AuthRequest{" +
                "username='" + username + '\'' +
                ", password='[PROTECTED]'" +
                '}';
    }
}

class AuthResponse {
    private String token;
    private String message;

    public AuthResponse(String token) {
        this.token = token;
        this.message = "Login successful";
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

class ErrorResponse {
    private String message;

    public ErrorResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

class SuccessResponse {
    private String message;

    public SuccessResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}