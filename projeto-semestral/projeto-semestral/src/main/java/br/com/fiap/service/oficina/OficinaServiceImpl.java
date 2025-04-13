package br.com.fiap.service.oficina;

import br.com.fiap.dto.oficina.OficinaRequestDto;
import br.com.fiap.dto.oficina.OficinaResponseDto;
import br.com.fiap.exception.OficinaNotFoundException; // Sua exceção customizada
import br.com.fiap.model.Oficina;
import br.com.fiap.repository.OficinaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OficinaServiceImpl implements OficinaService {

    private static final Logger log = LoggerFactory.getLogger(OficinaServiceImpl.class);
    private final OficinaRepository oficinaRepository;

    @Autowired
    public OficinaServiceImpl(OficinaRepository oficinaRepository) {
        this.oficinaRepository = oficinaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OficinaResponseDto> findAll() {
        log.info("Buscando todas as oficinas");
        return oficinaRepository.findAll().stream()
                .map(this::mapEntityToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OficinaResponseDto findById(Long id) {
        log.info("Buscando oficina por ID: {}", id);
        Oficina oficina = findOficinaById(id);
        return mapEntityToResponseDto(oficina);
    }

    @Override
    @Transactional
    public OficinaResponseDto create(OficinaRequestDto oficinaDto) {
        log.info("Criando nova oficina");
        try {
            Oficina oficina = mapRequestDtoToEntity(oficinaDto);
            Oficina savedOficina = oficinaRepository.save(oficina);
            log.info("Oficina criada com ID: {}", savedOficina.getId());
            return mapEntityToResponseDto(savedOficina);
        } catch (Exception e) {
            log.error("Erro ao criar oficina: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar oficina", e);
        }
    }

    @Override
    @Transactional
    public OficinaResponseDto update(Long id, OficinaRequestDto oficinaDto) {
        log.info("Atualizando oficina com ID: {}", id);
        Oficina existingOficina = findOficinaById(id);
        updateEntityFromDto(existingOficina, oficinaDto);
        Oficina updatedOficina = oficinaRepository.save(existingOficina);
        log.info("Oficina atualizada com ID: {}", updatedOficina.getId());
        return mapEntityToResponseDto(updatedOficina);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.info("Deletando oficina com ID: {}", id);
        Oficina oficina = findOficinaById(id);
        try {
            oficinaRepository.delete(oficina);
            log.info("Oficina deletada com ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar oficina com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar oficina com ID: " + id, e);
        }
    }

    // --- Mapeamento ---
    private Oficina findOficinaById(Long id) {
        return oficinaRepository.findById(id)
                .orElseThrow(() -> new OficinaNotFoundException("Oficina não encontrada com ID: " + id));
    }

    private OficinaResponseDto mapEntityToResponseDto(Oficina entity) {
        // Implementar mapeamento (ou usar MapStruct)
        OficinaResponseDto dto = new OficinaResponseDto();
        dto.setId(entity.getId());
        dto.setDataOficina(entity.getDataOficina());
        dto.setDescricaoProblema(entity.getDescricaoProblema());
        dto.setDiagnostico(entity.getDiagnostico());
        dto.setPartesAfetadas(entity.getPartesAfetadas());
        dto.setHorasTrabalhadas(entity.getHorasTrabalhadas()); // Mantém como String
        return dto;
    }

    private Oficina mapRequestDtoToEntity(OficinaRequestDto dto) {
        // Implementar mapeamento (ou usar MapStruct)
        Oficina entity = new Oficina();
        entity.setDataOficina(dto.getDataOficina());
        entity.setDescricaoProblema(dto.getDescricaoProblema());
        entity.setDiagnostico(dto.getDiagnostico());
        entity.setPartesAfetadas(dto.getPartesAfetadas());
        entity.setHorasTrabalhadas(dto.getHorasTrabalhadas()); // Mantém como String
        return entity;
    }

    private void updateEntityFromDto(Oficina entity, OficinaRequestDto dto) {
        // Implementar mapeamento (ou usar MapStruct)
        entity.setDataOficina(dto.getDataOficina());
        entity.setDescricaoProblema(dto.getDescricaoProblema());
        entity.setDiagnostico(dto.getDiagnostico());
        entity.setPartesAfetadas(dto.getPartesAfetadas());
        entity.setHorasTrabalhadas(dto.getHorasTrabalhadas()); // Mantém como String
    }
}