package br.com.fiap.dto.pagamento; // Pacote correto

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
public class PagamentoResponseDto {

    private Long id;
    private LocalDate dataPagamento;
    private String tipoPagamento;
    private BigDecimal desconto;       // O percentual armazenado na entidade
    private String totalParcelas;    // Como String (igual entidade)
    private BigDecimal valorParcelas;   // Valor calculado
    private BigDecimal totalComDesconto; // Valor calculado
}