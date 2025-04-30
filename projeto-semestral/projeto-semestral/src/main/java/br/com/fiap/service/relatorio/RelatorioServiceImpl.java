// src/main/java/br/com/fiap/service/relatorio/RelatorioServiceImpl.java
package br.com.fiap.service.relatorio;

import br.com.fiap.dto.relatorio.ContagemMensalDTO;
import br.com.fiap.dto.relatorio.ContagemMensalResultadoNativo;
import br.com.fiap.dto.relatorio.HistoricoAgendamentoClienteDTO;
import br.com.fiap.dto.relatorio.ServicoAgendadoDTO;
import br.com.fiap.exception.ClientesNotFoundException;
import br.com.fiap.model.relacionamentos.ClienteId;
import br.com.fiap.repository.AgendaRepository;
import br.com.fiap.repository.ClientesRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RelatorioServiceImpl implements RelatorioService {

    private static final Logger log = LoggerFactory.getLogger(RelatorioServiceImpl.class);
    private final AgendaRepository agendaRepository;
    private final ClientesRepository clientesRepository;

    @Autowired
    public RelatorioServiceImpl(AgendaRepository agendaRepository, ClientesRepository clientesRepository) {
        this.agendaRepository = agendaRepository;
        this.clientesRepository = clientesRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContagemMensalDTO> getContagemMensalAgendamentos() {
        log.info("Gerando relatório de contagem mensal de agendamentos.");
        try {
            List<ContagemMensalResultadoNativo> resultadosNativos = agendaRepository.countAgendamentosByMonthNative();
            List<ContagemMensalDTO> resultadoDTO = resultadosNativos.stream()
                    .map(nativo -> new ContagemMensalDTO(nativo.getMesAno(), nativo.getQuantidade()))
                    .collect(Collectors.toList());
            log.info("Relatório de contagem mensal gerado com {} resultados.", resultadoDTO.size());
            return resultadoDTO; // <<< CORREÇÃO: ADICIONADO O RETURN AQUI
        } catch (Exception e) {
            log.error("Erro ao gerar relatório de contagem mensal: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistoricoAgendamentoClienteDTO> getHistoricoAgendamentosCliente(ClienteId id) {
        log.info("Buscando histórico de agendamentos para Cliente ID: {}", id);
        // 1. Valida ID composto
        if (id == null || id.getIdCli() == null || id.getEnderecoId() == null) {
            throw new IllegalArgumentException("ID do Cliente (composto) inválido para buscar histórico.");
        }
        // 2. Verifica se o cliente existe
        if (!clientesRepository.existsById(id)) {
            log.warn("Tentativa de buscar histórico para cliente inexistente: {}", id);
            throw new ClientesNotFoundException("Cliente não encontrado com ID: " + id);
        }
        // 3. Busca o histórico
        try {
            List<HistoricoAgendamentoClienteDTO> historico = agendaRepository.findHistoricoAgendamentosByClienteId(id.getIdCli(), id.getEnderecoId());
            log.info("Encontrados {} registros de histórico para o cliente ID {}", historico.size(), id);
            return historico; // Return no sucesso
        } catch (Exception e) {
            log.error("Erro ao buscar histórico para cliente ID {}: {}", id, e.getMessage(), e);
            return Collections.emptyList(); // Return no erro
        }
        // Não há return fora do try/catch pois todas as branches retornam
    }


    @Override
    @Transactional(readOnly = true)
    public Page<ServicoAgendadoDTO> findServicosAgendados(LocalDate dataInicio, Pageable pageable) {
        log.info("Buscando relatório de serviços agendados a partir de {} com paginação {}", dataInicio, pageable);
        try {
            Page<ServicoAgendadoDTO> pagina = agendaRepository.findServicosAgendados(dataInicio, pageable);
            log.info("Encontrados {} serviços agendados na página {}/{}",
                    pagina.getNumberOfElements(),
                    pageable.getPageNumber(),
                    pagina.getTotalPages());
            return pagina; // Return no sucesso
        } catch (Exception e) {
            log.error("Erro ao buscar relatório de serviços agendados: {}", e.getMessage(), e);
            return Page.empty(pageable); // Return no erro
        }
        // Não há return fora do try/catch pois todas as branches retornam
    }
}