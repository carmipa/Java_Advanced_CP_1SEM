package br.com.fiap.config.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull; // Usar @NonNull para indicar que parâmetros não devem ser nulos
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter; // Garante que o filtro roda uma vez por requisição

import java.io.IOException;

@Component // Marca como um componente Spring
public class JwtAuthenticationFilter extends OncePerRequestFilter { // Extende OncePerRequestFilter

    @Autowired // Injete o TokenService que criamos
    private TokenService tokenService;

    @Autowired // Injete o UserDetailsService para carregar os detalhes do usuário
    private UserDetailsService userDetailsService;

    /**
     * Este método é executado uma vez para cada requisição HTTP.
     * Ele verifica se a requisição contém um token JWT válido.
     * @param request A requisição HTTP.
     * @param response A resposta HTTP.
     * @param filterChain A cadeia de filtros.
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request, // @NonNull indica que o parâmetro não deve ser nulo
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Tenta obter o cabeçalho Authorization
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail; // Usaremos o nome de usuário (email ou login) aqui

        // Verifica se o cabeçalho existe e começa com "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Se não houver token Bearer, passa para o próximo filtro na cadeia
            filterChain.doFilter(request, response);
            return; // Sai do método
        }

        // 2. Extrai o token JWT (removendo o prefixo "Bearer ")
        jwt = authHeader.substring(7); // "Bearer " tem 7 caracteres

        // 3. Extrai o nome de usuário do token
        // Se houver algum erro na extração (token inválido, etc.), o TokenService pode lançar exceções.
        // Podemos adicionar tratamento de exceção aqui se necessário, mas por enquanto,
        // deixaremos as exceções serem tratadas pelo Spring Security ou por um GlobalExceptionHandler.
        userEmail = tokenService.extractUsername(jwt);

        // 4. Verifica se o nome de usuário foi extraído E se o usuário NÃO está autenticado no contexto de segurança atual
        // SecurityContextHolder.getContext().getAuthentication() == null verifica se o usuário já foi autenticado nesta requisição
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 5. Carrega os detalhes do usuário usando o UserDetailsService
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 6. Valida o token
            if (tokenService.isTokenValid(jwt, userDetails)) {
                // Se o token for válido, cria um objeto de autenticação
                // UsernamePasswordAuthenticationToken é a implementação padrão
                // Passamos userDetails, credenciais (null para JWT, pois já autenticamos pelo token)
                // e as authorities (papéis/permissões) do usuário.
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null, // Credenciais são null para JWT após validação
                        userDetails.getAuthorities() // Papéis/Authorities do usuário
                );

                // Adiciona detalhes da requisição ao objeto de autenticação (opcional, mas boa prática)
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // 7. Define o objeto de autenticação no SecurityContextHolder
                // Isso informa ao Spring Security que o usuário atual está autenticado
                // para esta requisição.
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 8. Continua a cadeia de filtros
        // Passa a requisição (agora possivelmente autenticada) para o próximo filtro
        filterChain.doFilter(request, response);
    }
}
