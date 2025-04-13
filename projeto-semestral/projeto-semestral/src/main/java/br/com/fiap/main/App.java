package br.com.fiap.main;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean; // <-- Importar @Bean
import org.springframework.web.client.RestTemplate; // <-- Importar RestTemplate

@SpringBootApplication(scanBasePackages = "br.com.fiap")
public class App {

	public static void main(String[] args) {
		SpringApplication.run(App.class, args);
	}

	// Adiciona este método para criar o Bean do RestTemplate
	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

}