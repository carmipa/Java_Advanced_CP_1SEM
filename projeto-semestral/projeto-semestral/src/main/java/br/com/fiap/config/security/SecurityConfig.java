package br.com.fiap.config.security;

import br.com.fiap.config.security.jwt.JwtAuthenticationFilter; // Importe o filtro JWT
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider; // Importe AuthenticationProvider
import org.springframework.security.authentication.dao.DaoAuthenticationProvider; // Importe DaoAuthenticationProvider
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService; // Importe UserDetailsService
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // Importe este filtro padrão

@Configuration
@EnableWebSecurity // Habilita a configuração de segurança web do Spring Security
public class SecurityConfig {

    // Injete o filtro JWT que criamos
    private final JwtAuthenticationFilter jwtAuthFilter;
    // Injete o UserDetailsService (o seu AutenticarUserDetailsService)
    private final UserDetailsService userDetailsService;

    // Construtor para injetar as dependências
    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, UserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    // Define a cadeia de filtros de segurança HTTP
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Desabilita CSRF para APIs REST (stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Configura para não manter estado de sessão (RESTful)
                .authorizeHttpRequests(authorize -> authorize
                        // *** Rotas Públicas (PermitAll) Vêm Primeiro ***

                        // Permitir requisições OPTIONS para /auth/login (pré-voo CORS)
                        .requestMatchers(HttpMethod.OPTIONS, "/auth/login").permitAll() // <--- ADICIONADO!

                        // Endpoint de login (POST - DEVE ser público)
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()

                        // Endpoint de registro (se for público)
                        .requestMatchers(HttpMethod.POST, "/auth/register").permitAll()

                        // Endpoints de IA e CEP (se forem públicos)
                        .requestMatchers("/rest/ia/**").permitAll()
                        .requestMatchers("/rest/cep/**").permitAll()

                        // Documentação Swagger
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/webjars/**", "/swagger-resources/**").permitAll()
                        // Adicionar outros recursos públicos se houver (ex: arquivos estáticos)
                        // .requestMatchers("/public/**").permitAll()


                        // *** Rotas Protegidas (Authenticated) Vêm Depois ***

                        // Requer autenticação (via JWT) para todos os endpoints /rest/**
                        .requestMatchers("/rest/**").authenticated()

                        // Qualquer outra requisição que não foi explicitamente permitida acima
                        // também requer autenticação por padrão.
                        .anyRequest().authenticated() // Esta regra captura todo o resto
                );
        // ... restante da configuração (authenticationProvider, addFilterBefore) ...

        return http.build();
    }

    // Define o AuthenticationProvider que usará nosso UserDetailsService e PasswordEncoder
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        // Define o UserDetailsService para carregar os detalhes do usuário
        authProvider.setUserDetailsService(userDetailsService);
        // Define o PasswordEncoder para verificar a senha
        authProvider.setPasswordEncoder(passwordEncoder()); // <--- A CHAMADA ESTÁ AQUI
        return authProvider;
    }

    // Define o encoder de senha (BCrypt é recomendado)
    @Bean // <--- A DEFINIÇÃO DO MÉTODO ESTÁ AQUI
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Exponha o AuthenticationManager (necessário para autenticar o usuário no endpoint /auth/login)
    @Bean
    public org.springframework.security.authentication.AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
