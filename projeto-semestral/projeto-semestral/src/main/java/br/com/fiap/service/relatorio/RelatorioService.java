// src/main/java/br/com/fiap/service/relatorio/RelatorioService.java
package br.com.fiap.service.relatorio;

import br.com.fiap.dto.relatorio.*; // Importa todos os DTOs de relatório
import br.com.fiap.model.relacionamentos.ClienteId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

public interface RelatorioService {

    List<ContagemMensalDTO> getContagemMensalAgendamentos();
    List<HistoricoAgendamentoClienteDTO> getHistoricoAgendamentosCliente(ClienteId id);
    Page<ServicoAgendadoDTO> findServicosAgendados(LocalDate dataInicio, Pageable pageable);

    // --- NOVOS MÉTODOS PARA RELATÓRIOS DE PAGAMENTO ---
    EstatisticasPagamentosDto getEstatisticasPagamentos(LocalDate dataInicio, LocalDate dataFim);
    List<PagamentoPorTipoDto> getPagamentosPorTipo(LocalDate dataInicio, LocalDate dataFim);
    List<EvolucaoMensalValorDto> getEvolucaoMensalValorPagamentos(LocalDate dataInicio, LocalDate dataFim);
    // ----------------------------------------------------
}