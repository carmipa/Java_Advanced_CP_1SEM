package br.com.fiap.config.security; // <--- PACOTE CORRIGIDO PARA A NOVA LOCALIZAÇÃO

import br.com.fiap.model.autenticar.Autenticar; // Importe a entidade Autenticar
import br.com.fiap.repository.AutenticarRepository; // Importe o repositório Autenticar
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder; // Importe PasswordEncoder

@Configuration // Marca como classe de configuração (para garantir que o Bean seja criado)
public class DefaultUserInitializer {

    private static final Logger log = LoggerFactory.getLogger(DefaultUserInitializer.class);

    // Defina aqui o usuário e senha padrão que você deseja
    private static final String DEFAULT_USERNAME = "admin";
    private static final String DEFAULT_PASSWORD = "admin123"; // << ATENÇÃO: Use uma senha mais segura em ambientes reais!

    @Autowired
    private AutenticarRepository autenticarRepository; // Injete o repositório

    @Autowired
    private PasswordEncoder passwordEncoder; // Injete o PasswordEncoder

    @Bean
    public CommandLineRunner initDefaultUser() {
        return args -> {
            log.info("Verificando usuário padrão...");

            // Verifica se o usuário padrão já existe
            // Use findByUsuario que adicionamos no AutenticarRepository
            if (autenticarRepository.findByUsuario(DEFAULT_USERNAME).isEmpty()) {
                log.info("Usuário padrão '{}' não encontrado. Criando...", DEFAULT_USERNAME);

                // Cria a nova entidade Autenticar
                Autenticar defaultUser = new Autenticar();
                defaultUser.setUsuario(DEFAULT_USERNAME);
                // Criptografa a senha antes de salvar
                defaultUser.setSenha(passwordEncoder.encode(DEFAULT_PASSWORD));

                try {
                    // Salva o usuário no banco de dados
                    autenticarRepository.save(defaultUser);
                    log.info("Usuário padrão '{}' criado com sucesso.", DEFAULT_USERNAME);
                } catch (Exception e) {
                    log.error("Erro ao criar usuário padrão '{}': {}", DEFAULT_USERNAME, e.getMessage(), e);
                    // Em caso de erro (ex: problema de conexão com BD na inicialização), a aplicação pode falhar.
                    // Considere o tratamento de erro apropriado para o seu caso.
                }
            } else {
                log.info("Usuário padrão '{}' já existe.", DEFAULT_USERNAME);
            }
        };
    }
}
