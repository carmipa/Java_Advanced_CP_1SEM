// --- Arquivo: src/main/java/br/com/fiap/dto/relatorio/ClienteRelatorioCompletoDTO.java ---
package br.com.fiap.dto.relatorio;

import br.com.fiap.dto.agenda.AgendaResponseDto; // Ou um DTO mais simples
import br.com.fiap.dto.cliente.ClienteResponseDto;
import br.com.fiap.dto.orcamento.OrcamentoResponseDto;
import br.com.fiap.dto.pagamento.PagamentoResponseDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
// Importe DTOs específicos para Oficina e Peças se criá-los, ou use os existentes
import br.com.fiap.dto.oficina.OficinaResponseDto; // Exemplo
import br.com.fiap.dto.pecas.PecasResponseDto;     // Exemplo

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ClienteRelatorioCompletoDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private ClienteResponseDto cliente; // Dados básicos do cliente
    private List<VeiculoResponseDto> veiculos; // Lista de veículos do cliente
    private List<AgendaSimplificadoDTO> agendamentos; // Histórico de agendamentos (DTO simplificado)
    private List<OficinaServicoDTO> servicosOficina; // Serviços realizados (DTO com peças talvez?)
    private List<OrcamentoResponseDto> orcamentos; // Orçamentos associados ao cliente
    private List<PagamentoResponseDto> pagamentos; // Pagamentos associados ao cliente
    private long totalAgendamentos; // Contagem para o gráfico

    // --- Sub-DTOs Simplificados (Exemplos) ---
    // Você pode criar esses DTOs em seus respectivos pacotes ou aqui mesmo

    @Getter @Setter @NoArgsConstructor
    public static class AgendaSimplificadoDTO implements Serializable {
        private Long id;
        private String dataAgendamento; // Formatada
        private String observacao;
        private String veiculoPlaca; // Adicionar a placa para contexto
    }

    @Getter @Setter @NoArgsConstructor
    public static class OficinaServicoDTO implements Serializable {
        private Long idOficina;
        private String dataOficina; // Formatada
        private String descricaoProblema;
        private String diagnostico;
        private String partesAfetadas;
        private String horasTrabalhadas;
        private String veiculoPlaca; // Adicionar a placa
        private List<PecaUtilizadaDTO> pecasUtilizadas; // Lista de peças
    }

    @Getter @Setter @NoArgsConstructor
    public static class PecaUtilizadaDTO implements Serializable {
        private Long idPeca;
        private String descricaoPeca;
        private String fabricante;
        // Adicionar quantidade se a tabela de junção tiver
    }

}