package br.com.fiap;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean; // <-- Importar @Bean
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.client.RestTemplate; // <-- Importar RestTemplate

@EnableJpaRepositories
@SpringBootApplication
@ComponentScan(basePackages = "br.com.fiap")
@EnableCaching
@OpenAPIDefinition(info = @Info(title = "PROJETO-SEMESTRAL-1.0", description = "REFATORAÇÃO DO CHALLENGE 2024", version = "v1"))
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