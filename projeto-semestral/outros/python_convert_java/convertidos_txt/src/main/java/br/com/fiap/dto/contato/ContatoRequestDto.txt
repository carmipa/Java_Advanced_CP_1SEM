package br.com.fiap.dto.contato;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;

@Getter @Setter @NoArgsConstructor
public class ContatoRequestDto implements Serializable {
    private static final long serialVersionUID = 1L;

    // ID (codigo) Omitido

    @NotBlank(message = "Celular é obrigatório")
    @Size(max = 20) // DDL: VARCHAR2(20)
    private String celular;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Formato de email inválido")
    @Size(max = 50) // DDL: VARCHAR2(50)
    private String email;

    @NotBlank(message = "Nome do contato é obrigatório")
    @Size(max = 100) // DDL: VARCHAR2(100)
    private String contato; // Nome do campo no DTO
}