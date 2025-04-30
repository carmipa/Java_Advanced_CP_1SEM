package br.com.fiap.lojaMedieval;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

import java.util.Arrays;

@SpringBootApplication
public class LojaMedievalApplication {

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(LojaMedievalApplication.class);
		Environment env = app.run(args).getEnvironment();

		System.out.println("\n🔮 Loja Medieval iniciada com sucesso!");
		System.out.println("🌍 Ambiente ativo: " + Arrays.toString(env.getActiveProfiles()));
		System.out.println("📦 Aplicação: " + env.getProperty("spring.application.name", "lojaMedieval"));
		System.out.println("🔗 Acesse: http://localhost:" + env.getProperty("server.port", "8080") + "/");
		System.out.println();
	}
}