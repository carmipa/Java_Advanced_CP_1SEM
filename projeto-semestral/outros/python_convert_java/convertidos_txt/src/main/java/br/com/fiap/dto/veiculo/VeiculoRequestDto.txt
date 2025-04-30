package br.com.fiap.dto.veiculo;

import jakarta.validation.constraints.*; // Importa todas as validações
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class VeiculoRequestDto implements Serializable {
    private static final long serialVersionUID = 1L;

    // ID Omitido

    @NotBlank(message = "Tipo do veículo é obrigatório")
    @Size(max = 15) // DDL: VARCHAR2(15) not null
    private String tipoVeiculo;

    @NotBlank(message = "Renavam é obrigatório")
    @Size(max = 13) // DDL: VARCHAR2(13) not null
    // Adicionar @Pattern se houver formato específico para Renavam
    private String renavam;

    @NotBlank(message = "Placa é obrigatória")
    @Size(max = 7) // DDL: VARCHAR2(7) not null
    // Adicionar @Pattern para formato de placa (ex: Mercosul ou antiga)
    private String placa;

    @NotBlank(message = "Modelo é obrigatório")
    @Size(max = 100) // DDL: VARCHAR2(100) not null
    private String modelo;

    @NotBlank(message = "Proprietário é obrigatório")
    @Size(max = 50) // DDL: VARCHAR2(50) not null
    private String proprietario;

    @NotBlank(message = "Montadora é obrigatória")
    @Size(max = 100) // DDL: VARCHAR2(100) not null
    private String montadora;

    @NotBlank(message = "Cor é obrigatória")
    @Size(max = 50) // DDL: VARCHAR2(50) not null
    private String cor;

    @NotBlank(message = "Motor é obrigatório")
    @Size(max = 50) // DDL: VARCHAR2(50) not null
    private String motor;

    @NotNull(message = "Ano de fabricação é obrigatório")
    @PastOrPresent(message = "Ano de fabricação não pode ser futuro") // DDL: DATE not null
    private LocalDate anoFabricacao; // Mapeado como LocalDate
}