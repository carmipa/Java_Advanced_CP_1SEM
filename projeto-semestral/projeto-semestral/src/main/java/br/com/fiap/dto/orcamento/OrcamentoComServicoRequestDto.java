// Em br.com.fiap.dto.orcamento
package br.com.fiap.dto.orcamento;

import br.com.fiap.dto.oficina.ItemPecaServicoDto; // Import do DTO acima
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Positive;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class OrcamentoComServicoRequestDto {

    // --- Detalhes do Serviço da Oficina ---
    @NotNull(message = "Data do serviço da oficina é obrigatória")
    private LocalDate dataOficina; // Pode ser a mesma da dataOrcamento

    @NotBlank(message = "Descrição do problema é obrigatória")
    @Size(max = 500, message = "Descrição do problema pode ter no máximo 500 caracteres")
    private String descricaoProblema;

    @Size(max = 4000, message = "Diagnóstico pode ter no máximo 4000 caracteres")
    private String diagnostico; // Pode ser preenchido pela IA ou manualmente

    @NotBlank(message = "Partes afetadas são obrigatórias")
    @Size(max = 500, message = "Partes afetadas podem ter no máximo 500 caracteres")
    private String partesAfetadas;

    @NotBlank(message = "Horas trabalhadas na oficina são obrigatórias")
    @Size(max = 5, message = "Horas trabalhadas na oficina devem ter no máximo 5 caracteres")
    private String horasTrabalhadasOficina; // Ex: "2.5" ou "2:30" - backend precisará parsear

    @Valid // Valida a lista de itens
    private List<ItemPecaServicoDto> pecasUtilizadas;

    // --- Detalhes do Orçamento ---
    @NotNull(message = "Data do orçamento é obrigatória")
    @FutureOrPresent(message = "Data do orçamento não pode ser no passado, apenas presente ou futuro.")
    private LocalDate dataOrcamento;

    @NotNull(message = "Valor da mão de obra (taxa fixa/adicional) é obrigatório")
    @PositiveOrZero(message = "Valor da mão de obra não pode ser negativo")
    private BigDecimal valorMaoDeObraAdicional; // Uma taxa fixa, se houver

    @NotNull(message = "Valor da hora para orçamento é obrigatório")
    @Positive(message = "Valor da hora deve ser positivo")
    private BigDecimal valorHoraOrcamento;

    @NotNull(message = "Quantidade de horas para orçamento é obrigatória")
    @Positive(message = "Quantidade de horas deve ser positiva")
    private Integer quantidadeHorasOrcamento;

    // --- IDs para Associações (Opcional, mas útil para o frontend) ---
    private Long clienteId;
    private Long clienteEnderecoId; // Necessário devido à chave composta de Clientes
    private Long veiculoId;

    // ID da Oficina, caso o orçamento seja para um serviço já existente e queira apenas adicionar o orçamento
    private Long oficinaExistenteId;
}