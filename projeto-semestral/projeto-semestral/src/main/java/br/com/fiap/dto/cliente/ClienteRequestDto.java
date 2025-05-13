package br.com.fiap.dto.cliente;

import br.com.fiap.dto.contato.ContatoRequestDto; // Usa Request DTO aninhado
import br.com.fiap.dto.endereco.EnderecoRequestDto; // Usa Request DTO aninhado
import jakarta.validation.Valid;
import jakarta.validation.constraints.*; // Importa todas as validações
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class ClienteRequestDto implements Serializable {
    private static final long serialVersionUID = 1L;

    // IDs (idCli, enderecoId) Omitidos

    @NotBlank(message = "Tipo do cliente é obrigatório")
    @Size(max = 2, message = "Tipo do cliente deve ter no máximo 2 caracteres") // DDL: VARCHAR2(2)
    private String tipoCliente;

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 50) // DDL: VARCHAR2(50)
    private String nome;

    @NotBlank(message = "Sobrenome é obrigatório")
    @Size(max = 50) // DDL: VARCHAR2(50)
    private String sobrenome;

    @NotBlank(message = "Sexo é obrigatório")
    @Size(max = 2) // DDL: VARCHAR2(2)
    private String sexo;

    @NotBlank(message = "Tipo do documento é obrigatório")
    @Size(max = 10) // DDL: VARCHAR2(10)
    private String tipoDocumento;

    @NotBlank(message = "Número do documento é obrigatório")
    @Size(max = 20) // DDL: VARCHAR2(20)
    private String numeroDocumento; // Considerar adicionar @Pattern se houver formato específico

    @NotNull(message = "Data de nascimento é obrigatória")
    @Past(message = "Data de nascimento deve ser no passado") // DDL: DATE not null
    private LocalDate dataNascimento;

    @NotBlank(message = "Atividade profissional é obrigatória")
    @Size(max = 50) // DDL: VARCHAR2(50)
    private String atividadeProfissional;

    @NotNull(message = "Endereço é obrigatório")
    @Valid // Valida o DTO aninhado
    private EnderecoRequestDto endereco; // <-- Tipo Corrigido

    @NotNull(message = "Contato é obrigatório")
    @Valid // Valida o DTO aninhado
    private ContatoRequestDto contato; // <-- Tipo Corrigido

    // === Campos para Autenticação (Opcional) ===
    private String usuarioAutenticacao; // Nome de usuário para login
    private String senhaAutenticacao;   // Senha para login
}