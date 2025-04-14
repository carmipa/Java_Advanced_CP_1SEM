// --- src/main/java/br/com/fiap/service/pecas/PecasServiceImpl.java ---
package br.com.fiap.service.pecas;

import br.com.fiap.dto.pecas.PecasRequestDto;
import br.com.fiap.dto.pecas.PecasResponseDto;
import br.com.fiap.exception.PecasNotFoundException;
import br.com.fiap.mapper.PecasMapper; // Importar Mapper
import br.com.fiap.model.Pecas;
import br.com.fiap.repository.PecasRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PecasServiceImpl implements PecasService {

    private static final Logger log = LoggerFactory.getLogger(PecasServiceImpl.class);
    private final PecasRepository pecasRepository;
    private final PecasMapper pecasMapper; // <-- Injetar Mapper

    @Autowired
    public PecasServiceImpl(PecasRepository pecasRepository, PecasMapper pecasMapper) { // <-- Injetar
        this.pecasRepository = pecasRepository;
        this.pecasMapper = pecasMapper; // <-- Inicializar
    }

    @Override
    @Transactional(readOnly = true)
    public List<PecasResponseDto> findAll() {
        log.info("Buscando todas as peças");
        return pecasRepository.findAll().stream()
                .map(pecasMapper::toResponseDto) // <-- Usar Mapper
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PecasResponseDto findById(Long id) {
        log.info("Buscando peça por ID: {}", id);
        Pecas peca = findPecaById(id);
        return pecasMapper.toResponseDto(peca); // <-- Usar Mapper
    }

    @Override
    @Transactional
    public PecasResponseDto create(PecasRequestDto pecasDto) {
        log.info("Criando nova peça");
        // Adicionar lógica de cálculo se necessário
        try {
            Pecas peca = pecasMapper.toEntity(pecasDto); // <-- Usar Mapper
            Pecas savedPeca = pecasRepository.save(peca);
            log.info("Peça criada com ID: {}", savedPeca.getId());
            return pecasMapper.toResponseDto(savedPeca); // <-- Usar Mapper
        } catch (Exception e) {
            log.error("Erro ao criar peça: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar peça", e);
        }
    }

    @Override
    @Transactional
    public PecasResponseDto update(Long id, PecasRequestDto pecasDto) {
        log.info("Atualizando peça com ID: {}", id);
        Pecas existingPeca = findPecaById(id);
        pecasMapper.updateEntityFromDto(pecasDto, existingPeca); // <-- Usar Mapper
        // Recalcular campos se necessário
        Pecas updatedPeca = pecasRepository.save(existingPeca);
        log.info("Peça atualizada com ID: {}", updatedPeca.getId());
        return pecasMapper.toResponseDto(updatedPeca); // <-- Usar Mapper
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.info("Deletando peça com ID: {}", id);
        Pecas peca = findPecaById(id); // Verifica existência
        try {
            pecasRepository.delete(peca);
            log.info("Peça deletada com ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar peça com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar peça com ID: " + id, e);
        }
    }

    // --- Método auxiliar ---
    private Pecas findPecaById(Long id) {
        return pecasRepository.findById(id)
                .orElseThrow(() -> new PecasNotFoundException("Peça não encontrada com ID: " + id));
    }

    // REMOVER os métodos manuais de mapeamento:
    // mapEntityToResponseDto(Pecas entity)
    // mapRequestDtoToEntity(PecasRequestDto dto)
    // updateEntityFromDto(Pecas entity, PecasRequestDto dto)
}