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
public class PagamentoPorTipoDto {
    private String tipoPagamento;
    private Long quantidade;
    private BigDecimal valorTotal;
}