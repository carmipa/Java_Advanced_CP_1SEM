package br.com.fiap.dto.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {
    private String token; // O token JWT retornado
    // Você pode adicionar outras informações aqui se necessário, como nome do usuário, papéis, etc.
    // private String username;
    // private List<String> roles;
}
    