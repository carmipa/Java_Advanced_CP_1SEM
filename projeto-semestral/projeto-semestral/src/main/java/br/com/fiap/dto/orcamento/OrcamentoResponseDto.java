package br.com.fiap.dto.orcamento;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class OrcamentoResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id; // ID incluído
    private LocalDate dataOrcamento;
    private BigDecimal maoDeObra;
    private BigDecimal valorHora;
    private Integer quantidadeHoras;
    private BigDecimal valorTotal;
}