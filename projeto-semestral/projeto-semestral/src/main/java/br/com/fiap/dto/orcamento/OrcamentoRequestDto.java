package br.com.fiap.dto.orcamento;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero; // Para valores que podem ser zero
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class OrcamentoRequestDto implements Serializable {
    private static final long serialVersionUID = 1L;

    // ID Omitido

    @NotNull(message = "Data do orçamento é obrigatória")
    @PastOrPresent(message = "Data do orçamento não pode ser futura") // DDL: DATE not null
    private LocalDate dataOrcamento;

    @NotNull(message = "Valor da mão de obra é obrigatório")
    @PositiveOrZero(message = "Valor da mão de obra não pode ser negativo") // DDL: NUMBER not null
    private BigDecimal maoDeObra;

    @NotNull(message = "Valor por hora é obrigatório")
    @Positive(message = "Valor por hora deve ser positivo") // DDL: NUMBER not null
    private BigDecimal valorHora;

    @NotNull(message = "Quantidade de horas é obrigatória")
    @Positive(message = "Quantidade de horas deve ser positiva") // DDL: NUMBER not null
    private Integer quantidadeHoras;

    @NotNull(message = "Valor total é obrigatório")
    @PositiveOrZero(message = "Valor total não pode ser negativo") // DDL: NUMBER not null
    private BigDecimal valorTotal; // Este valor pode ser calculado no backend também
}