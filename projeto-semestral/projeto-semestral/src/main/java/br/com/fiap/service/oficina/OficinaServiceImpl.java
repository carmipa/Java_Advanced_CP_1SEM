// --- src/main/java/br/com/fiap/service/oficina/OficinaServiceImpl.java ---
package br.com.fiap.service.oficina;

import br.com.fiap.dto.oficina.OficinaRequestDto;
import br.com.fiap.dto.oficina.OficinaResponseDto;
import br.com.fiap.exception.OficinaNotFoundException;
import br.com.fiap.mapper.OficinaMapper; // Importar Mapper
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
    private final OficinaMapper oficinaMapper; // <-- Injetar Mapper

    @Autowired
    public OficinaServiceImpl(OficinaRepository oficinaRepository, OficinaMapper oficinaMapper) { // <-- Injetar
        this.oficinaRepository = oficinaRepository;
        this.oficinaMapper = oficinaMapper; // <-- Inicializar
    }

    @Override
    @Transactional(readOnly = true)
    public List<OficinaResponseDto> findAll() {
        log.info("Buscando todas as oficinas");
        return oficinaRepository.findAll().stream()
                .map(oficinaMapper::toResponseDto) // <-- Usar Mapper
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OficinaResponseDto findById(Long id) {
        log.info("Buscando oficina por ID: {}", id);
        Oficina oficina = findOficinaById(id);
        return oficinaMapper.toResponseDto(oficina); // <-- Usar Mapper
    }

    @Override
    @Transactional
    public OficinaResponseDto create(OficinaRequestDto oficinaDto) {
        log.info("Criando nova oficina");
        try {
            Oficina oficina = oficinaMapper.toEntity(oficinaDto); // <-- Usar Mapper
            Oficina savedOficina = oficinaRepository.save(oficina);
            log.info("Oficina criada com ID: {}", savedOficina.getId());
            return oficinaMapper.toResponseDto(savedOficina); // <-- Usar Mapper
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
        oficinaMapper.updateEntityFromDto(oficinaDto, existingOficina); // <-- Usar Mapper
        Oficina updatedOficina = oficinaRepository.save(existingOficina);
        log.info("Oficina atualizada com ID: {}", updatedOficina.getId());
        return oficinaMapper.toResponseDto(updatedOficina); // <-- Usar Mapper
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.info("Deletando oficina com ID: {}", id);
        Oficina oficina = findOficinaById(id); // Verifica existência
        try {
            oficinaRepository.delete(oficina);
            log.info("Oficina deletada com ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar oficina com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar oficina com ID: " + id, e);
        }
    }

    // --- Método auxiliar ---
    private Oficina findOficinaById(Long id) {
        return oficinaRepository.findById(id)
                .orElseThrow(() -> new OficinaNotFoundException("Oficina não encontrada com ID: " + id));
    }

    // REMOVER os métodos manuais de mapeamento:
    // mapEntityToResponseDto(Oficina entity)
    // mapRequestDtoToEntity(OficinaRequestDto dto)
    // updateEntityFromDto(Oficina entity, OficinaRequestDto dto)
}