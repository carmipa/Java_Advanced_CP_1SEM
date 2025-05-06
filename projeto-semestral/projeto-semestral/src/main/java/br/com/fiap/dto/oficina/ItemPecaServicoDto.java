// Em br.com.fiap.dto (ou um subpacote como br.com.fiap.dto.servico)
package br.com.fiap.dto.oficina; // Exemplo de pacote

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemPecaServicoDto {
    @NotNull(message = "ID da peça é obrigatório")
    private Long pecaId;

    @NotNull(message = "Quantidade da peça é obrigatória")
    @Min(value = 1, message = "Quantidade deve ser pelo menos 1")
    private Integer quantidade;
}