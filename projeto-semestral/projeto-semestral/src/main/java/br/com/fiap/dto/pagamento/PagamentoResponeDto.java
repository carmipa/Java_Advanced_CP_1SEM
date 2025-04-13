package br.com.fiap.dto.pagamento;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class PagamentoResponseDto implements Serializable { // Nome corrigido
    private static final long serialVersionUID = 1L;

    private Long id; // ID incluído
    private LocalDate dataPagamento;
    private String tipoPagamento;
    private BigDecimal desconto;
    private String totalParcelas; // Mantido como String
    private BigDecimal valorParcelas;
    private BigDecimal totalComDesconto;
}