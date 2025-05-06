// src/main/java/br/com/fiap/service/relatorio/RelatorioServiceImpl.java
package br.com.fiap.service.relatorio;

import br.com.fiap.dto.relatorio.*;
import br.com.fiap.exception.ClientesNotFoundException;
import br.com.fiap.model.relacionamentos.ClienteId;
import br.com.fiap.repository.AgendaRepository;
import br.com.fiap.repository.ClientesRepository;
import br.com.fiap.repository.PagamentoRepository; // Importado
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RelatorioServiceImpl implements RelatorioService {

    private static final Logger log = LoggerFactory.getLogger(RelatorioServiceImpl.class);
    private final AgendaRepository agendaRepository;
    private final ClientesRepository clientesRepository;
    private final PagamentoRepository pagamentoRepository; // Injetado

    @Autowired
    public RelatorioServiceImpl(AgendaRepository agendaRepository,
                                ClientesRepository clientesRepository,
                                PagamentoRepository pagamentoRepository) { // Adicionado ao construtor
        this.agendaRepository = agendaRepository;
        this.clientesRepository = clientesRepository;
        this.pagamentoRepository = pagamentoRepository; // Atribuído
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
            return resultadoDTO;
        } catch (Exception e) {
            log.error("Erro ao gerar relatório de contagem mensal: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistoricoAgendamentoClienteDTO> getHistoricoAgendamentosCliente(ClienteId id) {
        log.info("Buscando histórico de agendamentos para Cliente ID: {}", id);
        if (id == null || id.getIdCli() == null || id.getEnderecoId() == null) {
            throw new IllegalArgumentException("ID do Cliente (composto) inválido para buscar histórico.");
        }
        if (!clientesRepository.existsById(id)) {
            log.warn("Tentativa de buscar histórico para cliente inexistente: {}", id);
            throw new ClientesNotFoundException("Cliente não encontrado com ID: " + id);
        }
        try {
            List<HistoricoAgendamentoClienteDTO> historico = agendaRepository.findHistoricoAgendamentosByClienteId(id.getIdCli(), id.getEnderecoId());
            log.info("Encontrados {} registros de histórico para o cliente ID {}", historico.size(), id);
            return historico;
        } catch (Exception e) {
            log.error("Erro ao buscar histórico para cliente ID {}: {}", id, e.getMessage(), e);
            return Collections.emptyList();
        }
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
            return pagina;
        } catch (Exception e) {
            log.error("Erro ao buscar relatório de serviços agendados: {}", e.getMessage(), e);
            return Page.empty(pageable);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EstatisticasPagamentosDto getEstatisticasPagamentos(LocalDate dataInicio, LocalDate dataFim) {
        log.info("Gerando estatísticas de pagamentos para o período de {} a {}", dataInicio, dataFim);
        try {
            List<Object[]> result = pagamentoRepository.getEstatisticasPagamentos(dataInicio, dataFim);
            if (result != null && !result.isEmpty() && result.get(0) != null) {
                Object[] stats = result.get(0);
                Long totalOperacoes = (stats[0] instanceof Number) ? ((Number) stats[0]).longValue() : 0L;
                BigDecimal valorTotalArrecadado = (stats[1] instanceof BigDecimal) ? (BigDecimal) stats[1] : BigDecimal.ZERO;
                BigDecimal ticketMedio = BigDecimal.ZERO;
                if (stats[2] instanceof Number) {
                    ticketMedio = BigDecimal.valueOf(((Number) stats[2]).doubleValue()).setScale(2, BigDecimal.ROUND_HALF_UP);
                } else if (stats[2] instanceof BigDecimal) {
                    ticketMedio = ((BigDecimal) stats[2]).setScale(2, BigDecimal.ROUND_HALF_UP);
                }
                valorTotalArrecadado = valorTotalArrecadado == null ? BigDecimal.ZERO : valorTotalArrecadado;
                ticketMedio = ticketMedio == null ? BigDecimal.ZERO : ticketMedio;
                return new EstatisticasPagamentosDto(totalOperacoes, valorTotalArrecadado, ticketMedio);
            }
            return new EstatisticasPagamentosDto(0L, BigDecimal.ZERO, BigDecimal.ZERO);
        } catch (Exception e) {
            log.error("Erro ao gerar estatísticas de pagamentos: {}", e.getMessage(), e);
            return new EstatisticasPagamentosDto(0L, BigDecimal.ZERO, BigDecimal.ZERO);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagamentoPorTipoDto> getPagamentosPorTipo(LocalDate dataInicio, LocalDate dataFim) {
        log.info("Gerando relatório de pagamentos por tipo para o período de {} a {}", dataInicio, dataFim);
        try {
            return pagamentoRepository.findPagamentosAgrupadosPorTipo(dataInicio, dataFim);
        } catch (Exception e) {
            log.error("Erro ao gerar relatório de pagamentos por tipo: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvolucaoMensalValorDto> getEvolucaoMensalValorPagamentos(LocalDate dataInicio, LocalDate dataFim) {
        log.info("Gerando relatório de evolução mensal do valor dos pagamentos para o período de {} a {}", dataInicio, dataFim);
        try {
            // CORREÇÃO APLICADA AQUI: Processar List<Object[]>
            List<Object[]> resultadosNativos = pagamentoRepository.findEvolucaoMensalValorPagamentosNativo(dataInicio, dataFim);
            return resultadosNativos.stream()
                    .map(record -> {
                        String mesAno = (String) record[0];
                        // O SUM no Oracle pode retornar um tipo numérico que precisa ser convertido para BigDecimal
                        BigDecimal valorTotal = BigDecimal.ZERO;
                        if (record[1] instanceof BigDecimal) {
                            valorTotal = (BigDecimal) record[1];
                        } else if (record[1] instanceof Number) {
                            valorTotal = BigDecimal.valueOf(((Number)record[1]).doubleValue());
                        }
                        return new EvolucaoMensalValorDto(mesAno, valorTotal != null ? valorTotal : BigDecimal.ZERO);
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Erro ao gerar relatório de evolução mensal do valor dos pagamentos: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }
}