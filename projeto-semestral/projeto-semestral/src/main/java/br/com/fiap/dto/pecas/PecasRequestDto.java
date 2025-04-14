package br.com.fiap.dto.pecas;

import jakarta.validation.constraints.*; // Importa todas as validações
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class PecasRequestDto implements Serializable {
    private static final long serialVersionUID = 1L;

    // ID Omitido

    @NotBlank(message = "Tipo do veículo é obrigatório")
    @Size(max = 10) // DDL: VARCHAR2(10) not null
    private String tipoVeiculo;

    @NotBlank(message = "Fabricante é obrigatório")
    @Size(max = 50) // DDL: VARCHAR2(50) not null
    private String fabricante;

    @NotBlank(message = "Descrição da peça é obrigatória")
    @Size(max = 50) // DDL: DESCRICA_PECA VARCHAR2(50) not null
    private String descricao;

    @NotNull(message = "Data da compra é obrigatória")
    @PastOrPresent(message = "Data da compra não pode ser futura") // DDL: DATE not null
    private LocalDate dataCompra;

    @NotNull(message = "Preço é obrigatório")
    @Positive(message = "Preço deve ser positivo") // DDL: NUMBER not null
    private BigDecimal preco;

    @NotNull(message = "Desconto é obrigatório")
    @PositiveOrZero(message = "Desconto não pode ser negativo") // DDL: NUMBER not null
    private BigDecimal desconto;

    @NotNull(message = "Total com desconto é obrigatório")
    @PositiveOrZero(message = "Total com desconto não pode ser negativo") // DDL: NUMBER not null
    private BigDecimal totalDesconto;
}