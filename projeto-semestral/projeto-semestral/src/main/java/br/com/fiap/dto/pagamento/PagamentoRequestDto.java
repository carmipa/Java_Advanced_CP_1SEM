package br.com.fiap.dto.pagamento;

import jakarta.validation.constraints.*; // Importa todas as validações
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class PagamentoRequestDto implements Serializable {
    private static final long serialVersionUID = 1L;

    // ID Omitido

    @NotNull(message = "Data do pagamento é obrigatória")
    @PastOrPresent(message = "Data do pagamento não pode ser futura") // DDL: DATE not null
    private LocalDate dataPagamento;

    @NotBlank(message = "Tipo do pagamento é obrigatório")
    @Size(max = 20) // DDL: VARCHAR2(20) not null
    private String tipoPagamento;

    @NotNull(message = "Desconto é obrigatório")
    @PositiveOrZero(message = "Desconto não pode ser negativo") // DDL: NUMBER not null
    private BigDecimal desconto;

    @NotBlank(message = "Total de parcelas é obrigatório")
    @Size(max = 5) // DDL: VARCHAR2(5) not null
    @Pattern(regexp = "\\d+", message = "Total de parcelas deve conter apenas números") // Validação básica para string numérica
    private String totalParcelas; // Mapeado como String devido ao DDL

    @NotNull(message = "Valor das parcelas é obrigatório")
    @Positive(message = "Valor das parcelas deve ser positivo") // DDL: NUMBER not null
    private BigDecimal valorParcelas;

    @NotNull(message = "Total com desconto é obrigatório")
    @PositiveOrZero(message = "Total com desconto não pode ser negativo") // DDL: NUMBER not null
    private BigDecimal totalComDesconto;
}