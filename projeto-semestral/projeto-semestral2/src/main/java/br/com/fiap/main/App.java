package br.com.fiap.main;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "br.com.fiap")
public class App {

	public static void main(String[] args) {
		SpringApplication.run(App.class, args);
	}

}
