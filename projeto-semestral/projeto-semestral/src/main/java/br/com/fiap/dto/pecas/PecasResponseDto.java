package br.com.fiap.dto.pecas;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class PecasResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id; // ID incluído
    private String tipoVeiculo;
    private String fabricante;
    private String descricao;
    private LocalDate dataCompra;
    private BigDecimal preco;
    private BigDecimal desconto;
    private BigDecimal totalDesconto;
}