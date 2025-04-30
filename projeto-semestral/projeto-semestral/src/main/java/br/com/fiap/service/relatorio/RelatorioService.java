// src/main/java/br/com/fiap/service/relatorio/RelatorioService.java
package br.com.fiap.service.relatorio;

import br.com.fiap.dto.relatorio.ContagemMensalDTO;
import br.com.fiap.dto.relatorio.HistoricoAgendamentoClienteDTO;
import br.com.fiap.dto.relatorio.ServicoAgendadoDTO; // <<< Importar
import br.com.fiap.model.relacionamentos.ClienteId;
import org.springframework.data.domain.Page;      // <<< Importar Page
import org.springframework.data.domain.Pageable;   // <<< Importar Pageable
import java.time.LocalDate;                     // <<< Importar LocalDate
import java.util.List;

public interface RelatorioService {

    List<ContagemMensalDTO> getContagemMensalAgendamentos();
    List<HistoricoAgendamentoClienteDTO> getHistoricoAgendamentosCliente(ClienteId id);

    // <<< Assinatura Adicionada >>>
    Page<ServicoAgendadoDTO> findServicosAgendados(LocalDate dataInicio, Pageable pageable);
    // ---------------------------
}