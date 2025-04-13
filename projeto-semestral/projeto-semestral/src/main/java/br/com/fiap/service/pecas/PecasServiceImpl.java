package br.com.fiap.service.pecas;

import br.com.fiap.dto.pecas.PecasRequestDto;
import br.com.fiap.dto.pecas.PecasResponseDto;
import br.com.fiap.exception.PecasNotFoundException; // Sua exceção customizada
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

    @Autowired
    public PecasServiceImpl(PecasRepository pecasRepository) {
        this.pecasRepository = pecasRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PecasResponseDto> findAll() {
        log.info("Buscando todas as peças");
        return pecasRepository.findAll().stream()
                .map(this::mapEntityToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PecasResponseDto findById(Long id) {
        log.info("Buscando peça por ID: {}", id);
        Pecas peca = findPecaById(id);
        return mapEntityToResponseDto(peca);
    }

    @Override
    @Transactional
    public PecasResponseDto create(PecasRequestDto pecasDto) {
        log.info("Criando nova peça");
        // Adicionar Lógica de Negócio aqui (ex: calcular totalDesconto?)
        try {
            Pecas peca = mapRequestDtoToEntity(pecasDto);
            Pecas savedPeca = pecasRepository.save(peca);
            log.info("Peça criada com ID: {}", savedPeca.getId());
            return mapEntityToResponseDto(savedPeca);
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
        updateEntityFromDto(existingPeca, pecasDto);
        // Recalcular totalDesconto se necessário?
        Pecas updatedPeca = pecasRepository.save(existingPeca);
        log.info("Peça atualizada com ID: {}", updatedPeca.getId());
        return mapEntityToResponseDto(updatedPeca);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.info("Deletando peça com ID: {}", id);
        Pecas peca = findPecaById(id);
        try {
            pecasRepository.delete(peca);
            log.info("Peça deletada com ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar peça com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar peça com ID: " + id, e);
        }
    }

    // --- Mapeamento ---
    private Pecas findPecaById(Long id) {
        return pecasRepository.findById(id)
                .orElseThrow(() -> new PecasNotFoundException("Peça não encontrada com ID: " + id));
    }

    private PecasResponseDto mapEntityToResponseDto(Pecas entity) {
        // Implementar mapeamento (ou usar MapStruct)
        PecasResponseDto dto = new PecasResponseDto();
        dto.setId(entity.getId());
        dto.setTipoVeiculo(entity.getTipoVeiculo());
        dto.setFabricante(entity.getFabricante());
        dto.setDescricao(entity.getDescricao());
        dto.setDataCompra(entity.getDataCompra());
        dto.setPreco(entity.getPreco());
        dto.setDesconto(entity.getDesconto());
        dto.setTotalDesconto(entity.getTotalDesconto());
        return dto;
    }

    private Pecas mapRequestDtoToEntity(PecasRequestDto dto) {
        // Implementar mapeamento (ou usar MapStruct)
        Pecas entity = new Pecas();
        entity.setTipoVeiculo(dto.getTipoVeiculo());
        entity.setFabricante(dto.getFabricante());
        entity.setDescricao(dto.getDescricao());
        entity.setDataCompra(dto.getDataCompra());
        entity.setPreco(dto.getPreco());
        entity.setDesconto(dto.getDesconto());
        entity.setTotalDesconto(dto.getTotalDesconto()); // Ou calcular
        return entity;
    }

    private void updateEntityFromDto(Pecas entity, PecasRequestDto dto) {
        // Implementar mapeamento (ou usar MapStruct)
        entity.setTipoVeiculo(dto.getTipoVeiculo());
        entity.setFabricante(dto.getFabricante());
        entity.setDescricao(dto.getDescricao());
        entity.setDataCompra(dto.getDataCompra());
        entity.setPreco(dto.getPreco());
        entity.setDesconto(dto.getDesconto());
        entity.setTotalDesconto(dto.getTotalDesconto()); // Ou recalcular
    }
}