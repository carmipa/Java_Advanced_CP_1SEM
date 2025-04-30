package br.com.fiap.dto.pagamento;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class PagamentoResponseDto implements Serializable {

    private static final long serialVersionUID = 1L;

    Long id;
    LocalDate dataPagamento;
    String tipoPagamento;
    BigDecimal desconto;
    String totalParcelas;
    BigDecimal valorParcelas;
    BigDecimal totalComDesconto;
}