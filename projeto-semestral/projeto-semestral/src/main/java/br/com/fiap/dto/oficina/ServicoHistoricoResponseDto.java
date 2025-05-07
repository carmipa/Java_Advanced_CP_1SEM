// Pacote: br.com.fiap.dto.oficina (ou br.com.fiap.dto.relatorio)

package br.com.fiap.dto.oficina; // Ou br.com.fiap.dto.relatorio

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ServicoHistoricoResponseDto {
    private Long idOficina; // ID da Oficina (serviço)
    private LocalDate dataOficina;
    private String descricaoProblema;
    private String diagnostico;
    private String partesAfetadas;
    private String horasTrabalhadas;
    private List<ItemPecaServicoDto> pecasUtilizadas; // Reutiliza o DTO existente

    // Construtor pode ser útil
    public ServicoHistoricoResponseDto(Long idOficina, LocalDate dataOficina, String descricaoProblema, String diagnostico, String partesAfetadas, String horasTrabalhadas, List<ItemPecaServicoDto> pecasUtilizadas) {
        this.idOficina = idOficina;
        this.dataOficina = dataOficina;
        this.descricaoProblema = descricaoProblema;
        this.diagnostico = diagnostico;
        this.partesAfetadas = partesAfetadas;
        this.horasTrabalhadas = horasTrabalhadas;
        this.pecasUtilizadas = pecasUtilizadas;
    }
}