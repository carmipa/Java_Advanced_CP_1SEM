package br.com.fiap.dto.relatorio;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EstatisticasPagamentosDto {
    private Long totalOperacoes;
    private BigDecimal valorTotalArrecadado;
    private BigDecimal ticketMedio;
}