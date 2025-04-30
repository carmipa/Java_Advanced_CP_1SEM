package br.com.fiap.dto.oficina;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
// Poderia adicionar @Pattern para horasTrabalhadas se souber o formato exato
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class OficinaRequestDto implements Serializable {
    private static final long serialVersionUID = 1L;

    // ID Omitido

    @NotNull(message = "Data da oficina é obrigatória")
    @PastOrPresent(message = "Data da oficina não pode ser no futuro") // DDL: DATE not null
    private LocalDate dataOficina;

    @NotBlank(message = "Descrição do problema é obrigatória")
    @Size(max = 500) // DDL: VARCHAR2(500) not null
    private String descricaoProblema;

    @NotBlank(message = "Diagnóstico é obrigatório")
    @Size(max = 4000) // DDL: VARCHAR2(4000 char) not null
    private String diagnostico;

    @NotBlank(message = "Partes afetadas são obrigatórias")
    @Size(max = 500) // DDL: VARCHAR2(500) not null
    private String partesAfetadas;

    @NotBlank(message = "Horas trabalhadas são obrigatórias")
    @Size(max = 5, message = "Horas trabalhadas devem ter no máximo 5 caracteres") // DDL: VARCHAR2(5) not null
    // @Pattern(regexp = "\\d+", message = "Horas trabalhadas devem conter apenas números") // Exemplo, ajustar regex se necessário
    private String horasTrabalhadas; // Mapeado como String devido ao DDL
}