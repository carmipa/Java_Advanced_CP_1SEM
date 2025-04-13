package br.com.fiap.service.pagamento;

import br.com.fiap.dto.pagamento.PagamentoRequestDto;
import br.com.fiap.dto.pagamento.PagamentoResponseDto;
import br.com.fiap.exception.PagamentoNotFoundException; // Sua exceção customizada
import br.com.fiap.model.Pagamento;
import br.com.fiap.repository.PagamentoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PagamentoServiceImpl implements PagamentoService {

    private static final Logger log = LoggerFactory.getLogger(PagamentoServiceImpl.class);
    private final PagamentoRepository pagamentoRepository;

    @Autowired
    public PagamentoServiceImpl(PagamentoRepository pagamentoRepository) {
        this.pagamentoRepository = pagamentoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagamentoResponseDto> findAll() {
        log.info("Buscando todos os pagamentos");
        return pagamentoRepository.findAll().stream()
                .map(this::mapEntityToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PagamentoResponseDto findById(Long id) {
        log.info("Buscando pagamento por ID: {}", id);
        Pagamento pagamento = findPagamentoById(id);
        return mapEntityToResponseDto(pagamento);
    }

    @Override
    @Transactional
    public PagamentoResponseDto create(PagamentoRequestDto pagamentoDto) {
        log.info("Criando novo pagamento");
        // Adicionar Lógica de Negócio aqui (ex: calcular totalComDesconto?)
        try {
            Pagamento pagamento = mapRequestDtoToEntity(pagamentoDto);
            Pagamento savedPagamento = pagamentoRepository.save(pagamento);
            log.info("Pagamento criado com ID: {}", savedPagamento.getId());
            return mapEntityToResponseDto(savedPagamento);
        } catch (Exception e) {
            log.error("Erro ao criar pagamento: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar pagamento", e);
        }
    }

    @Override
    @Transactional
    public PagamentoResponseDto update(Long id, PagamentoRequestDto pagamentoDto) {
        log.info("Atualizando pagamento com ID: {}", id);
        Pagamento existingPagamento = findPagamentoById(id);
        updateEntityFromDto(existingPagamento, pagamentoDto);
        // Recalcular campos se necessário?
        Pagamento updatedPagamento = pagamentoRepository.save(existingPagamento);
        log.info("Pagamento atualizado com ID: {}", updatedPagamento.getId());
        return mapEntityToResponseDto(updatedPagamento);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.info("Deletando pagamento com ID: {}", id);
        Pagamento pagamento = findPagamentoById(id);
        try {
            pagamentoRepository.delete(pagamento);
            log.info("Pagamento deletado com ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar pagamento com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar pagamento com ID: " + id, e);
        }
    }

    // --- Mapeamento ---
    private Pagamento findPagamentoById(Long id) {
        return pagamentoRepository.findById(id)
                .orElseThrow(() -> new PagamentoNotFoundException("Pagamento não encontrado com ID: " + id));
    }

    private PagamentoResponseDto mapEntityToResponseDto(Pagamento entity) {
        // Implementar mapeamento (ou usar MapStruct)
        PagamentoResponseDto dto = new PagamentoResponseDto();
        dto.setId(entity.getId());
        dto.setDataPagamento(entity.getDataPagamento());
        dto.setTipoPagamento(entity.getTipoPagamento());
        dto.setDesconto(entity.getDesconto());
        dto.setTotalParcelas(entity.getTotalParcelas()); // String
        dto.setValorParcelas(entity.getValorParcelas());
        dto.setTotalComDesconto(entity.getTotalComDesconto());
        return dto;
    }

    private Pagamento mapRequestDtoToEntity(PagamentoRequestDto dto) {
        // Implementar mapeamento (ou usar MapStruct)
        Pagamento entity = new Pagamento();
        entity.setDataPagamento(dto.getDataPagamento());
        entity.setTipoPagamento(dto.getTipoPagamento());
        entity.setDesconto(dto.getDesconto());
        entity.setTotalParcelas(dto.getTotalParcelas()); // String
        entity.setValorParcelas(dto.getValorParcelas());
        entity.setTotalComDesconto(dto.getTotalComDesconto()); // Ou calcular
        return entity;
    }

    private void updateEntityFromDto(Pagamento entity, PagamentoRequestDto dto) {
        // Implementar mapeamento (ou usar MapStruct)
        entity.setDataPagamento(dto.getDataPagamento());
        entity.setTipoPagamento(dto.getTipoPagamento());
        entity.setDesconto(dto.getDesconto());
        entity.setTotalParcelas(dto.getTotalParcelas()); // String
        entity.setValorParcelas(dto.getValorParcelas());
        entity.setTotalComDesconto(dto.getTotalComDesconto()); // Ou recalcular
    }
}