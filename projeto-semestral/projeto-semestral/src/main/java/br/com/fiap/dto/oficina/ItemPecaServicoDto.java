// Pacote: br.com.fiap.dto.oficina
package br.com.fiap.dto.oficina;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // Lombok gera o construtor com todos os argumentos
public class ItemPecaServicoDto {

    @NotNull(message = "ID da peça é obrigatório")
    private Long pecaId;

    // Estes campos são opcionais no DTO de *request* para orçamento,
    // mas podem ser preenchidos na *resposta* do histórico
    private String descricaoPeca;
    private String fabricantePeca;

    @NotNull(message = "Quantidade da peça é obrigatória")
    @Min(value = 1, message = "Quantidade deve ser pelo menos 1")
    private Integer quantidade;

    // NENHUM CONSTRUTOR MANUAL AQUI, deixe o Lombok cuidar disso com @AllArgsConstructor
}