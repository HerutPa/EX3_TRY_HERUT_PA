package com.example.wordgame;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WordGameApplication {

    public static void main(String[] args) {
        System.out.println("=================================");
        System.out.println("Word Game Application Starting...");
        System.out.println("=================================");

        SpringApplication.run(WordGameApplication.class, args);

        System.out.println("Word Game Application Started Successfully!");
        System.out.println("Server running on: http://localhost:8080");
    }
}