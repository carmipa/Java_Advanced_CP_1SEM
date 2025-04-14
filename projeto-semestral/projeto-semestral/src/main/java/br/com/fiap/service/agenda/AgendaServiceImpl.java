// --- src/main/java/br/com/fiap/service/agenda/AgendaServiceImpl.java ---
package br.com.fiap.service.agenda;

import br.com.fiap.dto.agenda.AgendaRequestDto;
import br.com.fiap.dto.agenda.AgendaResponseDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto; // Manter se for implementar findVeiculosByAgendaId
import br.com.fiap.exception.AgendaNotFoundException;
import br.com.fiap.mapper.AgendaMapper; // Importar o Mapper
import br.com.fiap.model.Agenda;
// Importar Veiculo, AgendaVeiculo e repositórios relacionados se for implementar associação
// import br.com.fiap.model.Veiculo;
// import br.com.fiap.model.relacionamentos.AgendaVeiculo;
// import br.com.fiap.repository.VeiculoRepository;
// import br.com.fiap.repository.relacionamentos.AgendaVeiculoRepository;
import br.com.fiap.repository.AgendaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgendaServiceImpl implements AgendaService {

    private static final Logger log = LoggerFactory.getLogger(AgendaServiceImpl.class);
    private final AgendaRepository agendaRepository;
    private final AgendaMapper agendaMapper; // <-- Injetar o Mapper

    // Adicionar outros repositórios necessários para relacionamentos aqui
    // private final VeiculoRepository veiculoRepository;
    // private final AgendaVeiculoRepository agendaVeiculoRepository;

    @Autowired
    public AgendaServiceImpl(AgendaRepository agendaRepository,
                             AgendaMapper agendaMapper /*, VeiculoRepository veiculoRepository, AgendaVeiculoRepository agendaVeiculoRepository */) {
        this.agendaRepository = agendaRepository;
        this.agendaMapper = agendaMapper; // <-- Inicializar o Mapper
        // this.veiculoRepository = veiculoRepository;
        // this.agendaVeiculoRepository = agendaVeiculoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AgendaResponseDto> findAll() {
        log.info("Buscando todas as agendas");
        List<Agenda> agendas = agendaRepository.findAll();
        return agendas.stream()
                .map(agendaMapper::toResponseDto) // <-- Usar Mapper
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
        return agendaMapper.toResponseDto(agenda); // <-- Usar Mapper
    }

    @Override
    @Transactional
    public AgendaResponseDto create(AgendaRequestDto agendaDto) {
        log.info("Criando nova agenda para data: {}", agendaDto.getDataAgendamento());
        try {
            Agenda agenda = agendaMapper.toEntity(agendaDto); // <-- Usar Mapper
            Agenda savedAgenda = agendaRepository.save(agenda);
            log.info("Agenda criada com sucesso com ID: {}", savedAgenda.getId());
            return agendaMapper.toResponseDto(savedAgenda); // <-- Usar Mapper
        } catch (Exception e) {
            log.error("Erro ao salvar nova agenda: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar agenda", e);
        }
    }

    @Override
    @Transactional
    public AgendaResponseDto update(Long id, AgendaRequestDto agendaDto) {
        log.info("Atualizando agenda com ID: {}", id);
        Agenda existingAgenda = agendaRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Agenda não encontrada para atualização. ID: {}", id);
                    return new AgendaNotFoundException("Agenda não encontrada para atualização com ID: " + id);
                });

        agendaMapper.updateEntityFromDto(agendaDto, existingAgenda); // <-- Usar Mapper para atualizar campos
        Agenda updatedAgenda = agendaRepository.save(existingAgenda);
        log.info("Agenda atualizada com sucesso com ID: {}", updatedAgenda.getId());
        return agendaMapper.toResponseDto(updatedAgenda); // <-- Usar Mapper
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.info("Deletando agenda com ID: {}", id);
        if (!agendaRepository.existsById(id)) {
            log.warn("Tentativa de deletar agenda não encontrada. ID: {}", id);
            throw new AgendaNotFoundException("Agenda não encontrada para exclusão com ID: " + id);
        }
        try {
            agendaRepository.deleteById(id);
            log.info("Agenda deletada com sucesso com ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar agenda com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar agenda com ID: " + id, e);
        }
    }

    // --- Implementação dos métodos de relacionamento (Exemplo Agenda <-> Veiculo) ---

    @Override
    @Transactional
    public void associarVeiculo(Long agendaId, Long veiculoId) {
        log.info("Associando veículo ID {} à agenda ID {}", veiculoId, agendaId);
        // TODO: Implementar lógica
        // 1. Buscar Agenda ou lançar AgendaNotFoundException
        // 2. Buscar Veiculo ou lançar VeiculoNotFoundException (precisa injetar VeiculoRepository)
        // 3. Verificar se a associação já existe (opcional, mas recomendado - precisa injetar AgendaVeiculoRepository)
        // 4. Criar nova instância de AgendaVeiculo
        // 5. Setar agenda e veiculo na instância de AgendaVeiculo
        // 6. Salvar a instância de AgendaVeiculo (precisa injetar AgendaVeiculoRepository)
        throw new UnsupportedOperationException("Método associarVeiculo ainda não implementado.");
    }

    @Override
    @Transactional
    public void desassociarVeiculo(Long agendaId, Long veiculoId) {
        log.info("Desassociando veículo ID {} da agenda ID {}", veiculoId, agendaId);
        // TODO: Implementar lógica
        // 1. Buscar a entidade de junção AgendaVeiculo pelo agendaId e veiculoId (criar método no repository)
        // 2. Se encontrada, deletar a entidade AgendaVeiculo
        // 3. Se não encontrada, talvez logar um aviso ou lançar exceção
        throw new UnsupportedOperationException("Método desassociarVeiculo ainda não implementado.");
    }

    @Override
    @Transactional(readOnly = true)
    public List<VeiculoResponseDto> findVeiculosByAgendaId(Long agendaId) {
        log.info("Buscando veículos para agenda ID {}", agendaId);
        // TODO: Implementar lógica
        // 1. Buscar Agenda ou lançar AgendaNotFoundException
        // 2. Buscar todas as associações AgendaVeiculo para o agendaId (precisa injetar AgendaVeiculoRepository)
        // 3. Mapear a lista de Veiculo (obtido de cada AgendaVeiculo) para VeiculoResponseDto (precisa injetar VeiculoMapper)
        throw new UnsupportedOperationException("Método findVeiculosByAgendaId ainda não implementado.");
    }

    // REMOVER os métodos manuais de mapeamento:
    // mapEntityToResponseDto(Agenda entity)
    // mapRequestDtoToEntity(AgendaRequestDto dto)
    // updateEntityFromDto(Agenda entity, AgendaRequestDto dto)
}