package br.com.fiap.config.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service // Marca como um serviço Spring
public class TokenService {

    // Chave secreta para assinar e verificar os tokens
    // É ALTAMENTE recomendado que esta chave seja armazenada de forma segura
    // (ex: em variáveis de ambiente, HashiCorp Vault, etc.) e NÃO HARDCODADA!
    // Por enquanto, usaremos uma chave do application.properties
    @Value("${jwt.secret}") // Injeta o valor da propriedade 'jwt.secret'
    private String secret;

    // Tempo de expiração do token em milissegundos (ex: 24 horas)
    @Value("${jwt.expiration}") // Injeta o valor da propriedade 'jwt.expiration'
    private long expiration;

    /**
     * Extrai o nome de usuário (subject) do token JWT.
     * @param token O token JWT.
     * @return O nome de usuário.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extrai um claim específico do token JWT.
     * @param token O token JWT.
     * @param claimsResolver Função para resolver o claim.
     * @param <T> Tipo do claim.
     * @return O valor do claim.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extrai todos os claims do token JWT.
     * Requer a chave de assinatura.
     * @param token O token JWT.
     * @return Todos os claims.
     */
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSigningKey()) // Usa a chave de assinatura
                .build()
                .parseClaimsJws(token)
                .getBody(); // Retorna o corpo com os claims
    }

    /**
     * Obtém a chave de assinatura a partir da chave secreta.
     * A chave secreta deve ser codificada em Base64.
     * @return A chave de assinatura.
     */
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret); // Decodifica a chave secreta Base64
        return Keys.hmacShaKeyFor(keyBytes); // Cria uma chave HMAC SHA a partir dos bytes
    }


    /**
     * Gera um token JWT para um UserDetails.
     * @param userDetails Os detalhes do usuário.
     * @return O token JWT.
     */
    public String generateToken(UserDetails userDetails) {
        // Claims extras podem ser adicionados aqui, como papéis/autoridades
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Gera um token JWT com claims extras.
     * @param extraClaims Claims adicionais.
     * @param userDetails Os detalhes do usuário.
     * @return O token JWT.
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts
                .builder()
                .setClaims(extraClaims) // Adiciona claims extras
                .setSubject(userDetails.getUsername()) // Define o nome de usuário como subject
                .setIssuedAt(new Date(System.currentTimeMillis())) // Define a data de emissão
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // Define a data de expiração
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Assina o token com a chave e algoritmo HS256
                .compact(); // Compacta para a string final do token
    }

    /**
     * Verifica se o token JWT é válido.
     * @param token O token JWT.
     * @param userDetails Os detalhes do usuário para comparação.
     * @return true se o token for válido, false caso contrário.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        // Verifica se o nome de usuário no token corresponde ao UserDetails
        // e se o token não expirou.
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * Verifica se o token JWT expirou.
     * @param token O token JWT.
     * @return true se o token expirou, false caso contrário.
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date()); // Compara a data de expiração com a data atual
    }

    /**
     * Extrai a data de expiração do token JWT.
     * @param token O token JWT.
     * @return A data de expiração.
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
