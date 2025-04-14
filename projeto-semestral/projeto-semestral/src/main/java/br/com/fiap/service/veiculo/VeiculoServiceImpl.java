package br.com.fiap.service.veiculo;

import br.com.fiap.dto.veiculo.VeiculoRequestDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.exception.VeiculoNotFoundException;
import br.com.fiap.mapper.VeiculoMapper; // Importar Mapper
import br.com.fiap.model.Veiculo;
import br.com.fiap.repository.VeiculoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VeiculoServiceImpl implements VeiculoService {

    private static final Logger log = LoggerFactory.getLogger(VeiculoServiceImpl.class);
    private final VeiculoRepository veiculoRepository;
    private final VeiculoMapper veiculoMapper; // <-- Injetar Mapper

    @Autowired
    public VeiculoServiceImpl(VeiculoRepository veiculoRepository, VeiculoMapper veiculoMapper) { // <-- Injetar
        this.veiculoRepository = veiculoRepository;
        this.veiculoMapper = veiculoMapper; // <-- Inicializar
    }

    @Override
    @Transactional(readOnly = true)
    public List<VeiculoResponseDto> findAll() {
        log.info("Buscando todos os veículos");
        return veiculoRepository.findAll().stream()
                .map(veiculoMapper::toResponseDto) // <-- Usar Mapper
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VeiculoResponseDto findById(Long id) {
        log.info("Buscando veículo por ID: {}", id);
        Veiculo veiculo = findVeiculoById(id);
        return veiculoMapper.toResponseDto(veiculo); // <-- Usar Mapper
    }

    @Override
    @Transactional
    public VeiculoResponseDto create(VeiculoRequestDto veiculoDto) {
        log.info("Criando novo veículo, placa: {}", veiculoDto.getPlaca());
        try {
            Veiculo veiculo = veiculoMapper.toEntity(veiculoDto); // <-- Usar Mapper
            Veiculo savedVeiculo = veiculoRepository.save(veiculo);
            log.info("Veículo criado com ID: {}", savedVeiculo.getId());
            return veiculoMapper.toResponseDto(savedVeiculo); // <-- Usar Mapper
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
        veiculoMapper.updateEntityFromDto(veiculoDto, existingVeiculo); // <-- Usar Mapper
        Veiculo updatedVeiculo = veiculoRepository.save(existingVeiculo);
        log.info("Veículo atualizado com ID: {}", updatedVeiculo.getId());
        return veiculoMapper.toResponseDto(updatedVeiculo); // <-- Usar Mapper
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