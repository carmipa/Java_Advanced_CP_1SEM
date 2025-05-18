package br.com.fiap.config.security;

import br.com.fiap.config.security.jwt.JwtAuthenticationFilter; // Importe o filtro JWT
import br.com.fiap.service.security.AutenticarUserDetailsService; // Importe seu UserDetailsService

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider; // Importe AuthenticationProvider
import org.springframework.security.authentication.dao.DaoAuthenticationProvider; // Importe DaoAuthenticationProvider
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService; // Importe UserDetailsService (use AutenticarUserDetailsService)
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // Importe este filtro padrão

// Imports para CORS
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays; // Para Arrays.asList se permitir múltiplas origens

@Configuration
@EnableWebSecurity // Habilita a configuração de segurança web do Spring Security
public class SecurityConfig {

    // Injete o filtro JWT que criamos
    private final JwtAuthenticationFilter jwtAuthFilter;
    // Injete o UserDetailsService (o seu AutenticarUserDetailsService)
    private final AutenticarUserDetailsService userDetailsService; // Use o nome da sua classe

    // Construtor para injetar as dependências
    // Certifique-se que os nomes e tipos correspondem aos beans que você tem
    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, AutenticarUserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    // Define a cadeia de filtros de segurança HTTP
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Configuração de CORS aplicada AQUI
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // <<< APLICAÇÃO DA CONFIG DE CORS

                .csrf(csrf -> csrf.disable()) // Desabilita CSRF para APIs REST (stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Configura para não manter estado de sessão (RESTful)
                .authorizeHttpRequests(authorize -> authorize
                        // *** Rotas Públicas (PermitAll) Vêm Primeiro ***

                        // Permitir requisições OPTIONS para /auth/login (pré-voo CORS)
                        .requestMatchers(HttpMethod.OPTIONS, "/auth/login").permitAll()

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
                        .requestMatchers("/rest/**").authenticated() // <<< ROTA PROTEGIDA

                        // Qualquer outra requisição que NÃO comece com /rest/
                        // (como a raiz "/", outras páginas, /error)
                        // é explicitamente permitida aqui.
                        // A proteção para as rotas de PÁGINA será feita no FRONTEND (Opção B).
                        .anyRequest().permitAll() // <<< PERMITE TUDO O RESTO (incluindo rotas de página)
                )
                // Adiciona seu filtro JWT antes do filtro de autenticação padrão UsernamePasswordAuthenticationFilter
                // Este filtro irá interceptar requisições para rotas *.authenticated()
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);


        return http.build();
    }

    // Define a configuração de CORS como um Bean
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // *** Permite as origens do seu frontend ***
        // Adapte esta lista com os endereços exatos onde seu frontend pode rodar.
        // Use Arrays.asList para múltiplos endereços.
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",         // Geralmente útil para desenvolvimento local
                "http://172.16.72.110:3000"      // Endereço que apareceu no seu log
                // Adicione outros endereços se necessário (ex: domínio em produção)
        ));

        // Métodos HTTP permitidos (GET, POST, PUT, DELETE, OPTIONS)
        configuration.setAllowedMethods(Arrays.asList("*")); // Permite todos os métodos

        // Headers permitidos na requisição (Authorization, Content-Type, etc.)
        configuration.setAllowedHeaders(Arrays.asList("*")); // Permite todos os headers

        // Permite o envio de credenciais (necessário se usar cookies, seguro mesmo sem eles)
        configuration.setAllowCredentials(true);

        // Tempo máximo que a resposta de pré-voo (OPTIONS) pode ser cacheada pelo navegador
        // Pode ser útil para performance, mas não estritamente necessário para funcionar.
        // configuration.setMaxAge(3600L); // Opcional: cache por 1 hora

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplica esta configuração de CORS a todas as rotas da sua API ("/**")
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }


    // Define o AuthenticationProvider que usará nosso UserDetailsService e PasswordEncoder
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        // Define o UserDetailsService para carregar os detalhes do usuário
        authProvider.setUserDetailsService(userDetailsService); // Usa seu AutenticarUserDetailsService
        // Define o PasswordEncoder para verificar a senha
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // Define o encoder de senha (BCrypt é recomendado)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Exponha o AuthenticationManager (necessário para autenticar o usuário no endpoint /auth/login)
    @Bean
    public org.springframework.security.authentication.AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}