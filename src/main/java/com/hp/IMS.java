package com.hp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * The main entry point for the Spring Boot application.
 * 
 * The @SpringBootApplication annotation indicates that this is a Spring Boot application.
 * It combines the functionalities of @Configuration, @EnableAutoConfiguration, and @ComponentScan.
 */
@SpringBootApplication
public class IMS {

    /**
     * The main method which is used to run the Spring Boot application.
     */
    public static void main(String[] args) {
        // Launches the Spring Boot application
        SpringApplication.run(IMS.class, args);
    }
}
