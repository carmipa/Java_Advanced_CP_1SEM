// ===========================================================================
// 3. OficinaServiceImpl (Injeção Atualizada)
// Arquivo: src/main/java/br/com/fiap/service/oficina/OficinaServiceImpl.java
// ===========================================================================
package br.com.fiap.service.oficina;

// ... (Importações) ...
import br.com.fiap.service.ia.GoogleGeminiService; // <<< Importa a NOVA interface
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.fiap.dto.oficina.OficinaRequestDto;
import br.com.fiap.dto.oficina.OficinaResponseDto;
import br.com.fiap.exception.OficinaNotFoundException;
import br.com.fiap.mapper.OficinaMapper;
import br.com.fiap.model.Oficina;
import br.com.fiap.repository.OficinaRepository;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class OficinaServiceImpl implements OficinaService {

    private static final Logger log = LoggerFactory.getLogger(OficinaServiceImpl.class);
    private final OficinaRepository oficinaRepository;
    private final OficinaMapper oficinaMapper;
    // Injeção usa o novo nome da interface (pode ser removida se não usada aqui)
    // private final GoogleGeminiService iaService;

    @Autowired
    public OficinaServiceImpl(OficinaRepository oficinaRepository,
                              OficinaMapper oficinaMapper
            /* , GoogleGeminiService iaService */ ) { // <<< Tipo atualizado (removido do construtor se não for usado aqui)
        this.oficinaRepository = oficinaRepository;
        this.oficinaMapper = oficinaMapper;
        // this.iaService = iaService;
    }

    // ... (Restante da classe OficinaServiceImpl, método create SEM a chamada iaService) ...
    @Override
    @Transactional
    public OficinaResponseDto create(OficinaRequestDto oficinaDto) {
        log.info("Criando nova oficina (diagnóstico vindo do DTO)");
        try {
            Oficina oficina = oficinaMapper.toEntity(oficinaDto);
            // Chamada IA foi removida daqui
            Oficina savedOficina = oficinaRepository.save(oficina);
            log.info("Oficina criada com ID: {}", savedOficina.getId());
            return oficinaMapper.toResponseDto(savedOficina);
        } catch (Exception e) {
            log.error("Erro ao criar oficina: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar oficina", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<OficinaResponseDto> findAll() {
        log.info("Buscando todas as oficinas");
        return oficinaRepository.findAll().stream()
                .map(oficinaMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OficinaResponseDto findById(Long id) {
        log.info("Buscando oficina por ID: {}", id);
        Oficina oficina = findOficinaById(id);
        return oficinaMapper.toResponseDto(oficina);
    }

    @Override
    @Transactional
    public OficinaResponseDto update(Long id, OficinaRequestDto oficinaDto) {
        log.info("Atualizando oficina com ID: {}", id);
        Oficina existingOficina = findOficinaById(id);
        oficinaMapper.updateEntityFromDto(oficinaDto, existingOficina);
        Oficina updatedOficina = oficinaRepository.save(existingOficina);
        log.info("Oficina atualizada com ID: {}", updatedOficina.getId());
        return oficinaMapper.toResponseDto(updatedOficina);
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

    private Oficina findOficinaById(Long id) {
        return oficinaRepository.findById(id)
                .orElseThrow(() -> new OficinaNotFoundException("Oficina não encontrada com ID: " + id));
    }
}
