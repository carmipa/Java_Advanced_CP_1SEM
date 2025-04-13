package br.com.fiap.service.veiculo;

import br.com.fiap.dto.veiculo.VeiculoRequestDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.exception.VeiculoNotFoundException; // Sua exceção customizada
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

    @Autowired
    public VeiculoServiceImpl(VeiculoRepository veiculoRepository) {
        this.veiculoRepository = veiculoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<VeiculoResponseDto> findAll() {
        log.info("Buscando todos os veículos");
        return veiculoRepository.findAll().stream()
                .map(this::mapEntityToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VeiculoResponseDto findById(Long id) {
        log.info("Buscando veículo por ID: {}", id);
        Veiculo veiculo = findVeiculoById(id);
        return mapEntityToResponseDto(veiculo);
    }

    @Override
    @Transactional
    public VeiculoResponseDto create(VeiculoRequestDto veiculoDto) {
        log.info("Criando novo veículo, placa: {}", veiculoDto.getPlaca());
        try {
            Veiculo veiculo = mapRequestDtoToEntity(veiculoDto);
            Veiculo savedVeiculo = veiculoRepository.save(veiculo);
            log.info("Veículo criado com ID: {}", savedVeiculo.getId());
            return mapEntityToResponseDto(savedVeiculo);
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
        updateEntityFromDto(existingVeiculo, veiculoDto);
        Veiculo updatedVeiculo = veiculoRepository.save(existingVeiculo);
        log.info("Veículo atualizado com ID: {}", updatedVeiculo.getId());
        return mapEntityToResponseDto(updatedVeiculo);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.info("Deletando veículo com ID: {}", id);
        Veiculo veiculo = findVeiculoById(id);
        try {
            // Verificar lógicas de negócio ou dependências antes de deletar?
            veiculoRepository.delete(veiculo);
            log.info("Veículo deletado com ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar veículo com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar veículo com ID: " + id, e);
        }
    }

    // --- Mapeamento ---
    private Veiculo findVeiculoById(Long id) {
        return veiculoRepository.findById(id)
                .orElseThrow(() -> new VeiculoNotFoundException("Veículo não encontrado com ID: " + id));
    }

    private VeiculoResponseDto mapEntityToResponseDto(Veiculo entity) {
        // Implementar mapeamento (ou usar MapStruct)
        VeiculoResponseDto dto = new VeiculoResponseDto();
        dto.setId(entity.getId());
        dto.setTipoVeiculo(entity.getTipoVeiculo());
        dto.setRenavam(entity.getRenavam());
        dto.setPlaca(entity.getPlaca());
        dto.setModelo(entity.getModelo());
        dto.setProprietario(entity.getProprietario());
        dto.setMontadora(entity.getMontadora());
        dto.setCor(entity.getCor());
        dto.setMotor(entity.getMotor());
        dto.setAnoFabricacao(entity.getAnoFabricacao());
        return dto;
    }

    private Veiculo mapRequestDtoToEntity(VeiculoRequestDto dto) {
        // Implementar mapeamento (ou usar MapStruct)
        Veiculo entity = new Veiculo();
        entity.setTipoVeiculo(dto.getTipoVeiculo());
        entity.setRenavam(dto.getRenavam());
        entity.setPlaca(dto.getPlaca());
        entity.setModelo(dto.getModelo());
        entity.setProprietario(dto.getProprietario());
        entity.setMontadora(dto.getMontadora());
        entity.setCor(dto.getCor());
        entity.setMotor(dto.getMotor());
        entity.setAnoFabricacao(dto.getAnoFabricacao());
        return entity;
    }

    private void updateEntityFromDto(Veiculo entity, VeiculoRequestDto dto) {
        // Implementar mapeamento (ou usar MapStruct)
        entity.setTipoVeiculo(dto.getTipoVeiculo());
        entity.setRenavam(dto.getRenavam());
        entity.setPlaca(dto.getPlaca());
        entity.setModelo(dto.getModelo());
        entity.setProprietario(dto.getProprietario());
        entity.setMontadora(dto.getMontadora());
        entity.setCor(dto.getCor());
        entity.setMotor(dto.getMotor());
        entity.setAnoFabricacao(dto.getAnoFabricacao());
    }
}