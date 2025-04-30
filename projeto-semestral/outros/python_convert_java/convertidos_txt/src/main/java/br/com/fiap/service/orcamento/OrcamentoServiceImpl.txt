// --- src/main/java/br/com/fiap/service/orcamento/OrcamentoServiceImpl.java ---
package br.com.fiap.service.orcamento;

import br.com.fiap.dto.orcamento.OrcamentoRequestDto;
import br.com.fiap.dto.orcamento.OrcamentoResponseDto;
import br.com.fiap.exception.OrcamentoNotFoundException;
import br.com.fiap.mapper.OrcamentoMapper; // Importar Mapper
import br.com.fiap.model.Orcamento;
import br.com.fiap.repository.OrcamentoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
// import java.math.BigDecimal; // Se for implementar cálculo

@Service
public class OrcamentoServiceImpl implements OrcamentoService {

    private static final Logger log = LoggerFactory.getLogger(OrcamentoServiceImpl.class);
    private final OrcamentoRepository orcamentoRepository;
    private final OrcamentoMapper orcamentoMapper; // <-- Injetar Mapper

    @Autowired
    public OrcamentoServiceImpl(OrcamentoRepository orcamentoRepository, OrcamentoMapper orcamentoMapper) { // <-- Injetar
        this.orcamentoRepository = orcamentoRepository;
        this.orcamentoMapper = orcamentoMapper; // <-- Inicializar
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrcamentoResponseDto> findAll() {
        log.info("Buscando todos os orçamentos");
        return orcamentoRepository.findAll().stream()
                .map(orcamentoMapper::toResponseDto) // <-- Usar Mapper
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrcamentoResponseDto findById(Long id) {
        log.info("Buscando orçamento por ID: {}", id);
        Orcamento orcamento = findOrcamentoById(id);
        return orcamentoMapper.toResponseDto(orcamento); // <-- Usar Mapper
    }

    @Override
    @Transactional
    public OrcamentoResponseDto create(OrcamentoRequestDto orcamentoDto) {
        log.info("Criando novo orçamento");
        // Adicionar lógica de cálculo se necessário antes de mapear/salvar
        try {
            Orcamento orcamento = orcamentoMapper.toEntity(orcamentoDto); // <-- Usar Mapper
            // Recalcular valor total aqui se a regra for essa
            // orcamento.setValorTotal(calcularValorTotal(orcamento));
            Orcamento savedOrcamento = orcamentoRepository.save(orcamento);
            log.info("Orçamento criado com ID: {}", savedOrcamento.getId());
            return orcamentoMapper.toResponseDto(savedOrcamento); // <-- Usar Mapper
        } catch (Exception e) {
            log.error("Erro ao criar orçamento: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar orçamento", e);
        }
    }

    @Override
    @Transactional
    public OrcamentoResponseDto update(Long id, OrcamentoRequestDto orcamentoDto) {
        log.info("Atualizando orçamento com ID: {}", id);
        Orcamento existingOrcamento = findOrcamentoById(id);
        orcamentoMapper.updateEntityFromDto(orcamentoDto, existingOrcamento); // <-- Usar Mapper
        // Recalcular valor total se necessário
        // existingOrcamento.setValorTotal(calcularValorTotal(existingOrcamento));
        Orcamento updatedOrcamento = orcamentoRepository.save(existingOrcamento);
        log.info("Orçamento atualizado com ID: {}", updatedOrcamento.getId());
        return orcamentoMapper.toResponseDto(updatedOrcamento); // <-- Usar Mapper
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.info("Deletando orçamento com ID: {}", id);
        Orcamento orcamento = findOrcamentoById(id); // Verifica existência
        try {
            orcamentoRepository.delete(orcamento);
            log.info("Orçamento deletado com ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar orçamento com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar orçamento com ID: " + id, e);
        }
    }

    // --- Método auxiliar ---
    private Orcamento findOrcamentoById(Long id) {
        return orcamentoRepository.findById(id)
                .orElseThrow(() -> new OrcamentoNotFoundException("Orçamento não encontrado com ID: " + id));
    }

    // REMOVER os métodos manuais de mapeamento:
    // mapEntityToResponseDto(Orcamento entity)
    // mapRequestDtoToEntity(OrcamentoRequestDto dto)
    // updateEntityFromDto(Orcamento entity, OrcamentoRequestDto dto)

    // Manter método de cálculo se existir e for usado:
    // private BigDecimal calcularValorTotal(Orcamento orcamento) { ... }
}