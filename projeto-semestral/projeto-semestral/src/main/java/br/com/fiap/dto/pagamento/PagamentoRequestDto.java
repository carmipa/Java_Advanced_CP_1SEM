package br.com.fiap.dto.pagamento; // Pacote correto

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PagamentoRequestDto {

    @NotNull(message = "Data do pagamento é obrigatória")
    private LocalDate dataPagamento;

    @NotBlank(message = "Tipo de pagamento é obrigatório")
    @Size(max = 20, message = "Tipo de pagamento não pode exceder 20 caracteres")
    private String tipoPagamento;

    @NotNull(message = "Percentual de desconto é obrigatório")
    @DecimalMin(value = "0.0", message = "Desconto não pode ser negativo")
    @DecimalMax(value = "100.0", message = "Desconto não pode ser maior que 100")
    private BigDecimal descontoPercentual; // Recebe o %

    @NotNull(message = "Total de parcelas é obrigatório")
    @Min(value = 1, message = "Deve haver pelo menos 1 parcela")
    private Integer totalParcelas; // Recebe como número

    @NotNull(message = "Valor do serviço é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor do serviço deve ser positivo")
    private BigDecimal valorServico; // Necessário para cálculo

    // IDs opcionais para relacionamentos (ajuste se necessário)
    private Long clienteId;
    private Long orcamentoId;
}