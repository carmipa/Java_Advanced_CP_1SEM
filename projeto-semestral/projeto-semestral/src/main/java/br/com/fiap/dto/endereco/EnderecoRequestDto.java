package br.com.fiap.dto.endereco;

import com.fasterxml.jackson.annotation.JsonProperty; // Para mapear JSON ViaCEP se necessário
import jakarta.validation.constraints.*; // Importa todas as validações
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;

@Getter @Setter @NoArgsConstructor
public class EnderecoRequestDto implements Serializable {
    private static final long serialVersionUID = 1L;

    // ID (codigo) Omitido

    @NotNull(message = "Número do endereço é obrigatório")
    @Positive(message = "Número deve ser positivo")
    private Integer numero; // DDL: NUMBER not null

    @NotBlank(message = "CEP é obrigatório")
    @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP inválido. Formato: 00000-000 ou 00000000")
    @Size(max = 10) // DDL: VARCHAR2(10) not null
    private String cep;

    @NotBlank(message = "Logradouro é obrigatório")
    @Size(max = 100) // DDL: VARCHAR2(100) not null
    private String logradouro;

    @NotBlank(message = "Cidade é obrigatória")
    @Size(max = 100) // DDL: VARCHAR2(100) not null
    @JsonProperty("localidade") // Mantém compatibilidade com ViaCEP se usar Jackson
    private String cidade;

    @NotBlank(message = "Bairro é obrigatório")
    @Size(max = 100) // DDL: VARCHAR2(100) not null
    private String bairro;

    @NotBlank(message = "Estado é obrigatório")
    @Size(max = 50) // DDL: VARCHAR2(50) not null
    @JsonProperty("uf") // Mantém compatibilidade com ViaCEP se usar Jackson
    private String estado;

    @Size(max = 100) // DDL: VARCHAR2(100) nullable
    private String complemento;
}