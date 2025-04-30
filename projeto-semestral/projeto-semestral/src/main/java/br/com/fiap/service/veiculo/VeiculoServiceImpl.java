// src/main/java/br/com/fiap/service/veiculo/VeiculoServiceImpl.java
package br.com.fiap.service.veiculo;

// --- Imports ---
import br.com.fiap.dto.veiculo.VeiculoRequestDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.exception.VeiculoNotFoundException;
import br.com.fiap.mapper.VeiculoMapper;
import br.com.fiap.model.Veiculo;
import br.com.fiap.repository.VeiculoRepository;
import br.com.fiap.repository.specification.VeiculoSpecification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
// ---------------

@Service
public class VeiculoServiceImpl implements VeiculoService {

    private static final Logger log = LoggerFactory.getLogger(VeiculoServiceImpl.class);
    private final VeiculoRepository veiculoRepository;
    private final VeiculoMapper veiculoMapper;

    @Autowired
    public VeiculoServiceImpl(VeiculoRepository veiculoRepository, VeiculoMapper veiculoMapper) {
        this.veiculoRepository = veiculoRepository;
        this.veiculoMapper = veiculoMapper;
    }

    // --- IMPLEMENTAÇÃO DO MÉTODO DE BUSCA ---
    @Override
    @Transactional(readOnly = true)
    public List<VeiculoResponseDto> buscarVeiculos(String placa, String modelo, String proprietario) {
        log.info("Buscando veículos com critérios: placa='{}', modelo='{}', proprietario='{}'", placa, modelo, proprietario);

        // Combina as especificações baseadas nos parâmetros não nulos/vazios
        Specification<Veiculo> spec = Specification.where(null); // Base neutra
        if (placa != null && !placa.isBlank()) {
            spec = spec.and(VeiculoSpecification.placaContains(placa));
        }
        if (modelo != null && !modelo.isBlank()) {
            spec = spec.and(VeiculoSpecification.modeloContains(modelo));
        }
        if (proprietario != null && !proprietario.isBlank()) {
            spec = spec.and(VeiculoSpecification.proprietarioContains(proprietario));
        }

        // Validação para evitar busca sem critério (se desejado)
        if ((placa == null || placa.isBlank()) && (modelo == null || modelo.isBlank()) && (proprietario == null || proprietario.isBlank())) {
            log.warn("Busca de veículos chamada sem critérios válidos.");
            return List.of(); // Retorna lista vazia
        }

        List<Veiculo> veiculosEncontrados = veiculoRepository.findAll(spec); // Usa findAll com Specification
        log.info("Encontrados {} veículos para os critéiros.", veiculosEncontrados.size());

        return veiculosEncontrados.stream()
                .map(veiculoMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    // <<< FIM DA IMPLEMENTAÇÃO DA BUSCA >>>


    // --- Métodos CRUD e Auxiliar (como antes) ---
    @Override
    @Transactional(readOnly = true)
    public List<VeiculoResponseDto> findAll() {
        log.info("Buscando todos os veículos");
        return veiculoRepository.findAll().stream()
                .map(veiculoMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VeiculoResponseDto findById(Long id) {
        log.info("Buscando veículo por ID: {}", id);
        Veiculo veiculo = findVeiculoById(id);
        return veiculoMapper.toResponseDto(veiculo);
    }

    @Override
    @Transactional
    public VeiculoResponseDto create(VeiculoRequestDto veiculoDto) {
        log.info("Criando novo veículo, placa: {}", veiculoDto.getPlaca());
        try {
            Veiculo veiculo = veiculoMapper.toEntity(veiculoDto);
            Veiculo savedVeiculo = veiculoRepository.save(veiculo);
            log.info("Veículo criado com ID: {}", savedVeiculo.getId());
            return veiculoMapper.toResponseDto(savedVeiculo);
        } catch (Exception e) {
            log.error("Erro ao criar veículo: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar veículo", e);
        }
    }

    @Override
    @Transactional
    public VeiculoResponseDto update(Long id, VeiculoRequestDto veiculoDto) {
        log.info("Atualizando veículo com ID: {}", id);
        Veiculo existingVeiculo = findVeiculoById(id);
        veiculoMapper.updateEntityFromDto(veiculoDto, existingVeiculo);
        Veiculo updatedVeiculo = veiculoRepository.save(existingVeiculo);
        log.info("Veículo atualizado com ID: {}", updatedVeiculo.getId());
        return veiculoMapper.toResponseDto(updatedVeiculo);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.info("Deletando veículo com ID: {}", id);
        Veiculo veiculo = findVeiculoById(id); // Verifica existência
        try {
            veiculoRepository.delete(veiculo);
            log.info("Veículo deletado com ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar veículo com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar veículo com ID: " + id, e);
        }
    }

    // --- Método auxiliar ---
    private Veiculo findVeiculoById(Long id) {
        return veiculoRepository.findById(id)
                .orElseThrow(() -> new VeiculoNotFoundException("Veículo não encontrado com ID: " + id));
    }
}