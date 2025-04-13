package br.com.fiap.service.orcamento;

import br.com.fiap.dto.orcamento.OrcamentoRequestDto;
import br.com.fiap.dto.orcamento.OrcamentoResponseDto;
import br.com.fiap.exception.OrcamentoNotFoundException; // Sua exceção customizada
import br.com.fiap.model.Orcamento;
import br.com.fiap.repository.OrcamentoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrcamentoServiceImpl implements OrcamentoService {

    private static final Logger log = LoggerFactory.getLogger(OrcamentoServiceImpl.class);
    private final OrcamentoRepository orcamentoRepository;

    @Autowired
    public OrcamentoServiceImpl(OrcamentoRepository orcamentoRepository) {
        this.orcamentoRepository = orcamentoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrcamentoResponseDto> findAll() {
        log.info("Buscando todos os orçamentos");
        return orcamentoRepository.findAll().stream()
                .map(this::mapEntityToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrcamentoResponseDto findById(Long id) {
        log.info("Buscando orçamento por ID: {}", id);
        Orcamento orcamento = findOrcamentoById(id);
        return mapEntityToResponseDto(orcamento);
    }

    @Override
    @Transactional
    public OrcamentoResponseDto create(OrcamentoRequestDto orcamentoDto) {
        log.info("Criando novo orçamento");
        // ADICIONAR LÓGICA DE NEGÓCIO AQUI (ex: calcular valorTotal?)
        try {
            Orcamento orcamento = mapRequestDtoToEntity(orcamentoDto);
            // Exemplo: Se valorTotal não vier no DTO, calcular aqui
            // if (orcamento.getValorTotal() == null) {
            //     orcamento.setValorTotal(calcularValorTotal(orcamento));
            // }
            Orcamento savedOrcamento = orcamentoRepository.save(orcamento);
            log.info("Orçamento criado com ID: {}", savedOrcamento.getId());
            return mapEntityToResponseDto(savedOrcamento);
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
        updateEntityFromDto(existingOrcamento, orcamentoDto);
        // Recalcular valor total se necessário?
        // existingOrcamento.setValorTotal(calcularValorTotal(existingOrcamento));
        Orcamento updatedOrcamento = orcamentoRepository.save(existingOrcamento);
        log.info("Orçamento atualizado com ID: {}", updatedOrcamento.getId());
        return mapEntityToResponseDto(updatedOrcamento);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.info("Deletando orçamento com ID: {}", id);
        Orcamento orcamento = findOrcamentoById(id);
        // Lógica de negócio antes de deletar? Verificar dependências?
        try {
            orcamentoRepository.delete(orcamento);
            log.info("Orçamento deletado com ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar orçamento com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar orçamento com ID: " + id, e);
        }
    }

    // --- Mapeamento ---
    private Orcamento findOrcamentoById(Long id) {
        return orcamentoRepository.findById(id)
                .orElseThrow(() -> new OrcamentoNotFoundException("Orçamento não encontrado com ID: " + id));
    }

    private OrcamentoResponseDto mapEntityToResponseDto(Orcamento entity) {
        // Implementar mapeamento (ou usar MapStruct)
        OrcamentoResponseDto dto = new OrcamentoResponseDto();
        dto.setId(entity.getId());
        dto.setDataOrcamento(entity.getDataOrcamento());
        dto.setMaoDeObra(entity.getMaoDeObra());
        dto.setValorHora(entity.getValorHora());
        dto.setQuantidadeHoras(entity.getQuantidadeHoras());
        dto.setValorTotal(entity.getValorTotal());
        return dto;
    }

    private Orcamento mapRequestDtoToEntity(OrcamentoRequestDto dto) {
        // Implementar mapeamento (ou usar MapStruct)
        Orcamento entity = new Orcamento();
        entity.setDataOrcamento(dto.getDataOrcamento());
        entity.setMaoDeObra(dto.getMaoDeObra());
        entity.setValorHora(dto.getValorHora());
        entity.setQuantidadeHoras(dto.getQuantidadeHoras());
        entity.setValorTotal(dto.getValorTotal()); // Ou calcular no serviço
        return entity;
    }

    private void updateEntityFromDto(Orcamento entity, OrcamentoRequestDto dto) {
        // Implementar mapeamento (ou usar MapStruct)
        entity.setDataOrcamento(dto.getDataOrcamento());
        entity.setMaoDeObra(dto.getMaoDeObra());
        entity.setValorHora(dto.getValorHora());
        entity.setQuantidadeHoras(dto.getQuantidadeHoras());
        entity.setValorTotal(dto.getValorTotal()); // Ou recalcular
    }

    // Exemplo de método de lógica de negócio
    // private BigDecimal calcularValorTotal(Orcamento orcamento) {
    //    if (orcamento.getValorHora() != null && orcamento.getQuantidadeHoras() != null) {
    //        BigDecimal horas = BigDecimal.valueOf(orcamento.getQuantidadeHoras());
    //        BigDecimal custoHoras = orcamento.getValorHora().multiply(horas);
    //        return custoHoras.add(orcamento.getMaoDeObra() != null ? orcamento.getMaoDeObra() : BigDecimal.ZERO);
    //    }
    //    return orcamento.getValorTotal(); // Retorna o valor existente se não puder calcular
    // }
}