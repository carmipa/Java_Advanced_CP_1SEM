// --- src/main/java/br/com/fiap/service/agenda/AgendaServiceImpl.java ---
package br.com.fiap.service.agenda;

// TODOS OS IMPORTS NECESSÁRIOS (como na resposta anterior)
import br.com.fiap.dto.agenda.AgendaRequestDto;
import br.com.fiap.dto.agenda.AgendaResponseDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.exception.AgendaNotFoundException;
import br.com.fiap.exception.VeiculoNotFoundException;
import br.com.fiap.exception.AssociacaoNotFoundException; // Ou AgendaNotFoundException
import br.com.fiap.mapper.AgendaMapper;
import br.com.fiap.mapper.VeiculoMapper;
import br.com.fiap.model.Agenda;
import br.com.fiap.model.Veiculo;
import br.com.fiap.model.relacionamentos.AgendaVeiculo;
import br.com.fiap.repository.AgendaRepository;
import br.com.fiap.repository.VeiculoRepository;
import br.com.fiap.repository.relacionamentos.AgendaVeiculoRepository;
import br.com.fiap.repository.specification.AgendaSpecification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgendaServiceImpl implements AgendaService { // Chave de abertura da classe

    private static final Logger log = LoggerFactory.getLogger(AgendaServiceImpl.class);
    private final AgendaRepository agendaRepository;
    private final AgendaMapper agendaMapper;
    private final VeiculoRepository veiculoRepository;
    private final AgendaVeiculoRepository agendaVeiculoRepository;
    private final VeiculoMapper veiculoMapper;

    @Autowired
    public AgendaServiceImpl(AgendaRepository agendaRepository,
                             AgendaMapper agendaMapper,
                             VeiculoRepository veiculoRepository,
                             AgendaVeiculoRepository agendaVeiculoRepository,
                             VeiculoMapper veiculoMapper
    ) {
        this.agendaRepository = agendaRepository;
        this.agendaMapper = agendaMapper;
        this.veiculoRepository = veiculoRepository;
        this.agendaVeiculoRepository = agendaVeiculoRepository;
        this.veiculoMapper = veiculoMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AgendaResponseDto> findWithFilters(LocalDate dataInicio, LocalDate dataFim, String observacao, Pageable pageable) {
        // ... (código do método findWithFilters - sem alterações)
        log.info("Buscando agendas com filtros: dataInicio={}, dataFim={}, observacao='{}', pageable={}",
                dataInicio, dataFim, observacao, pageable);
        Specification<Agenda> spec = Specification.where(null);
        if (dataInicio != null) {
            spec = spec.and(AgendaSpecification.dataAgendamentoMaiorOuIgualA(dataInicio));
        }
        if (dataFim != null) {
            spec = spec.and(AgendaSpecification.dataAgendamentoMenorOuIgualA(dataFim));
        }
        if (observacao != null && !observacao.isBlank()) {
            spec = spec.and(AgendaSpecification.observacaoContem(observacao));
        }
        Page<Agenda> paginaAgenda = agendaRepository.findAll(spec, pageable);
        log.info("Encontradas {} agendas na página {}/{}", paginaAgenda.getNumberOfElements(), pageable.getPageNumber(), paginaAgenda.getTotalPages());
        return paginaAgenda.map(agendaMapper::toResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public AgendaResponseDto findById(Long id) {
        // ... (código do método findById - sem alterações)
        log.info("Buscando agenda por ID: {}", id);
        Agenda agenda = agendaRepository.findById(id)
                .orElseThrow(() -> new AgendaNotFoundException("Agenda não encontrada com ID: " + id));
        return agendaMapper.toResponseDto(agenda);
    }

    @Override
    @Transactional
    public AgendaResponseDto create(AgendaRequestDto agendaDto) {
        // ... (código do método create - sem alterações)
        log.info("Criando nova agenda para data: {}", agendaDto.getDataAgendamento());
        try {
            Agenda agenda = agendaMapper.toEntity(agendaDto);
            Agenda savedAgenda = agendaRepository.save(agenda);
            log.info("Agenda criada com sucesso com ID: {}", savedAgenda.getId());
            return agendaMapper.toResponseDto(savedAgenda);
        } catch (Exception e) {
            log.error("Erro ao salvar nova agenda: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar agenda", e);
        }
    }

    @Override
    @Transactional
    public AgendaResponseDto update(Long id, AgendaRequestDto agendaDto) {
        // ... (código do método update - sem alterações)
        log.info("Atualizando agenda com ID: {}", id);
        Agenda existingAgenda = agendaRepository.findById(id)
                .orElseThrow(() -> new AgendaNotFoundException("Agenda não encontrada para atualização com ID: " + id));
        agendaMapper.updateEntityFromDto(agendaDto, existingAgenda);
        Agenda updatedAgenda = agendaRepository.save(existingAgenda);
        log.info("Agenda atualizada com sucesso com ID: {}", updatedAgenda.getId());
        return agendaMapper.toResponseDto(updatedAgenda);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        // ... (código do método deleteById - sem alterações)
        log.info("Deletando agenda com ID: {}", id);
        if (!agendaRepository.existsById(id)) {
            throw new AgendaNotFoundException("Agenda não encontrada para exclusão com ID: " + id);
        }
        try {
            List<AgendaVeiculo> associacoes = agendaVeiculoRepository.findByAgendaId(id);
            if (!associacoes.isEmpty()) {
                agendaVeiculoRepository.deleteAllInBatch(associacoes);
                log.info("Removidas {} associações da tabela AV para Agenda ID {}.", associacoes.size(), id);
            }
            agendaRepository.deleteById(id);
            log.info("Agenda ID {} deletada com sucesso.", id);
        } catch (DataIntegrityViolationException e) {
            log.error("Erro de integridade ao deletar agenda ID {}: Verifique outras dependências.", id, e);
            throw new RuntimeException("Não é possível deletar a agenda pois ela está associada a outros registros.", e);
        } catch (Exception e) {
            log.error("Erro ao deletar agenda com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar agenda com ID: " + id, e);
        }
    }

    @Override
    @Transactional
    public void associarVeiculo(Long agendaId, Long veiculoId) { // Chave de abertura do método
        // ... (código do método associarVeiculo - sem alterações)
        log.info("Associando veículo ID {} à agenda ID {}", veiculoId, agendaId);
        Agenda agenda = agendaRepository.findById(agendaId)
                .orElseThrow(() -> new AgendaNotFoundException("Agenda não encontrada com ID: " + agendaId));
        Veiculo veiculo = veiculoRepository.findById(veiculoId)
                .orElseThrow(() -> new VeiculoNotFoundException("Veículo não encontrado com ID: " + veiculoId));
        if (agendaVeiculoRepository.existsByAgendaIdAndVeiculoId(agendaId, veiculoId)) {
            log.warn("Associação entre Agenda ID {} e Veículo ID {} já existe.", agendaId, veiculoId);
            return;
        }
        AgendaVeiculo novaAssociacao = new AgendaVeiculo();
        novaAssociacao.setAgenda(agenda);
        novaAssociacao.setVeiculo(veiculo);
        try {
            agendaVeiculoRepository.save(novaAssociacao);
            log.info("Veículo ID {} associado à Agenda ID {} com sucesso.", veiculoId, agendaId);
        } catch (Exception e) {
            log.error("Erro ao salvar associação entre Agenda {} e Veículo {}: {}", agendaId, veiculoId, e.getMessage(), e);
            throw new RuntimeException("Falha ao associar veículo à agenda.", e);
        }
    } // Chave de fechamento do método associarVeiculo

    @Override
    @Transactional
    public void desassociarVeiculo(Long agendaId, Long veiculoId) { // Chave de abertura do método
        // ... (código do método desassociarVeiculo - sem alterações)
        log.info("Desassociando veículo ID {} da agenda ID {}", veiculoId, agendaId);
        AgendaVeiculo associacao = agendaVeiculoRepository.findByAgendaIdAndVeiculoId(agendaId, veiculoId)
                .orElseThrow(() -> new AssociacaoNotFoundException( // Ou AgendaNotFoundException
                        String.format("Associação entre Agenda ID %d e Veículo ID %d não encontrada.", agendaId, veiculoId))
                );
        try {
            agendaVeiculoRepository.delete(associacao);
            log.info("Veículo ID {} desassociado da Agenda ID {} com sucesso.", veiculoId, agendaId);
        } catch (Exception e) {
            log.error("Erro ao deletar associação entre Agenda {} e Veículo {}: {}", agendaId, veiculoId, e.getMessage(), e);
            throw new RuntimeException("Falha ao desassociar veículo da agenda.", e);
        }
    } // Chave de fechamento do método desassociarVeiculo

    @Override
    @Transactional(readOnly = true)
    public List<VeiculoResponseDto> findVeiculosByAgendaId(Long agendaId) { // Chave de abertura do método
        // ... (código do método findVeiculosByAgendaId - sem alterações)
        log.info("Buscando veículos para agenda ID {}", agendaId);
        if (!agendaRepository.existsById(agendaId)) {
            throw new AgendaNotFoundException("Agenda não encontrada com ID: " + agendaId);
        }
        List<AgendaVeiculo> associacoes = agendaVeiculoRepository.findByAgendaId(agendaId);
        if (associacoes.isEmpty()) {
            log.info("Nenhum veículo associado à Agenda ID {}.", agendaId);
            return Collections.emptyList();
        }
        List<Veiculo> veiculos = associacoes.stream()
                .map(AgendaVeiculo::getVeiculo)
                .collect(Collectors.toList());
        log.info("Retornando {} veículos para a agenda {}", veiculos.size(), agendaId);
        return veiculos.stream()
                .map(veiculoMapper::toResponseDto)
                .collect(Collectors.toList());
    } // Chave de fechamento do método findVeiculosByAgendaId

} // <<<===== CERTIFIQUE-SE DE QUE ESTA CHAVE FINAL EXISTE NO SEU ARQUIVO!