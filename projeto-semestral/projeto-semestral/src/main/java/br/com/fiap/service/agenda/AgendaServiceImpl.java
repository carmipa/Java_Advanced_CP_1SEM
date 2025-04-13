package br.com.fiap.service.agenda; // Ou br.com.fiap.service.agendaService

import br.com.fiap.dto.agenda.AgendaRequestDto;
import br.com.fiap.dto.agenda.AgendaResponseDto;
import br.com.fiap.exception.AgendaNotFoundException; // Sua exceção customizada
import br.com.fiap.model.Agenda;
import br.com.fiap.repository.AgendaRepository;
import org.slf4j.Logger; // Usar SLF4J
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import do Spring @Transactional

import java.util.List;
import java.util.stream.Collectors;

@Service // Marca como um Bean de Serviço do Spring
public class AgendaServiceImpl implements AgendaService {

    private static final Logger log = LoggerFactory.getLogger(AgendaServiceImpl.class);

    private final AgendaRepository agendaRepository;

    // Injeção de Dependência via construtor (preferível)
    @Autowired
    public AgendaServiceImpl(AgendaRepository agendaRepository) {
        this.agendaRepository = agendaRepository;
    }

    @Override
    @Transactional(readOnly = true) // Transação apenas para leitura
    public List<AgendaResponseDto> findAll() {
        log.info("Buscando todas as agendas");
        List<Agenda> agendas = agendaRepository.findAll();
        // Mapeia a lista de Entidades para lista de Response DTOs
        return agendas.stream()
                .map(this::mapEntityToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AgendaResponseDto findById(Long id) {
        log.info("Buscando agenda por ID: {}", id);
        Agenda agenda = agendaRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Agenda não encontrada para ID: {}", id);
                    return new AgendaNotFoundException("Agenda não encontrada com ID: " + id);
                });
        return mapEntityToResponseDto(agenda);
    }

    @Override
    @Transactional // Transação de escrita (padrão readOnly = false)
    public AgendaResponseDto create(AgendaRequestDto agendaDto) {
        log.info("Criando nova agenda para data: {}", agendaDto.getDataAgendamento());
        try {
            Agenda agenda = mapRequestDtoToEntity(agendaDto);
            // ID é nulo aqui, JPA/Hibernate fará um INSERT
            Agenda savedAgenda = agendaRepository.save(agenda);
            log.info("Agenda criada com sucesso com ID: {}", savedAgenda.getId());
            return mapEntityToResponseDto(savedAgenda);
        } catch (Exception e) {
            // Aqui poderíamos lançar uma AgendaNotSavedException se quiséssemos,
            // mas por enquanto deixamos o Spring tratar ou logamos o erro.
            log.error("Erro ao salvar nova agenda: {}", e.getMessage(), e);
            // Re-lançar uma exceção customizada ou mais genérica se apropriado
            throw new RuntimeException("Falha ao criar agenda", e);
        }
    }

    @Override
    @Transactional
    public AgendaResponseDto update(Long id, AgendaRequestDto agendaDto) {
        log.info("Atualizando agenda com ID: {}", id);
        // 1. Busca a entidade existente ou lança exceção
        Agenda existingAgenda = agendaRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Agenda não encontrada para atualização. ID: {}", id);
                    return new AgendaNotFoundException("Agenda não encontrada para atualização com ID: " + id);
                });

        // 2. Atualiza os campos da entidade existente com os dados do DTO
        updateEntityFromDto(existingAgenda, agendaDto);

        // 3. Salva a entidade atualizada (JPA/Hibernate fará um UPDATE)
        Agenda updatedAgenda = agendaRepository.save(existingAgenda);
        log.info("Agenda atualizada com sucesso com ID: {}", updatedAgenda.getId());
        return mapEntityToResponseDto(updatedAgenda);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.info("Deletando agenda com ID: {}", id);
        // 1. Verifica se existe antes de deletar para poder lançar nossa exceção
        if (!agendaRepository.existsById(id)) {
            log.warn("Tentativa de deletar agenda não encontrada. ID: {}", id);
            throw new AgendaNotFoundException("Agenda não encontrada para exclusão com ID: " + id);
        }
        // 2. Deleta
        try {
            agendaRepository.deleteById(id);
            log.info("Agenda deletada com sucesso com ID: {}", id);
        } catch (Exception e) {
            // Captura outras possíveis exceções de persistência (ex: DataIntegrityViolationException)
            log.error("Erro ao deletar agenda com ID {}: {}", id, e.getMessage(), e);
            // Re-lançar uma exceção customizada ou mais genérica
            throw new RuntimeException("Falha ao deletar agenda com ID: " + id, e);
        }
    }

    // --- Métodos Auxiliares de Mapeamento (Privados) ---
    // (Você pode usar uma biblioteca como MapStruct para gerar isso)

    private AgendaResponseDto mapEntityToResponseDto(Agenda entity) {
        AgendaResponseDto dto = new AgendaResponseDto();
        dto.setId(entity.getId());
        dto.setDataAgendamento(entity.getDataAgendamento());
        dto.setObservacao(entity.getObservacao());
        return dto;
    }

    private Agenda mapRequestDtoToEntity(AgendaRequestDto dto) {
        Agenda entity = new Agenda();
        // Não setamos o ID aqui, ele será gerado pelo banco
        entity.setDataAgendamento(dto.getDataAgendamento());
        entity.setObservacao(dto.getObservacao());
        return entity;
    }

    private void updateEntityFromDto(Agenda entity, AgendaRequestDto dto) {
        entity.setDataAgendamento(dto.getDataAgendamento());
        entity.setObservacao(dto.getObservacao());
        // Não atualizamos o ID
    }
}