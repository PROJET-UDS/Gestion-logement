package com.immobilier.logement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class LogementApplication {

	public static void main(String[] args) {
		SpringApplication.run(LogementApplication.class, args);
	}

}
