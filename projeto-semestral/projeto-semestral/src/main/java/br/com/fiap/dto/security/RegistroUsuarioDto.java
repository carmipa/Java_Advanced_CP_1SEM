package br.com.fiap.dto.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistroUsuarioDto {

    @NotBlank(message = "Nome de usuário é obrigatório")
    @Size(max = 100, message = "Nome de usuário deve ter no máximo 100 caracteres")
    private String usuario;

    @NotBlank(message = "Senha é obrigatória")
    @Size(max = 100, message = "Senha deve ter no máximo 100 caracteres") // Note: this is max for the *input* password. BCrypt hash will be longer.
    private String senha;

    // Opcional: Adicionar campos para ID do Cliente se o registro de usuário for acoplado à criação do cliente.
    // private Long clienteId;
    // private Long clienteEnderecoId;
}