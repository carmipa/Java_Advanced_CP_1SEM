// --- src/main/java/br/com/fiap/service/pagamento/PagamentoServiceImpl.java ---
package br.com.fiap.service.pagamento;

import br.com.fiap.dto.pagamento.PagamentoRequestDto;
import br.com.fiap.dto.pagamento.PagamentoResponseDto;
import br.com.fiap.exception.PagamentoNotFoundException;
import br.com.fiap.mapper.PagamentoMapper; // Importar Mapper
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
    private final PagamentoMapper pagamentoMapper; // <-- Injetar Mapper

    @Autowired
    public PagamentoServiceImpl(PagamentoRepository pagamentoRepository, PagamentoMapper pagamentoMapper) { // <-- Injetar
        this.pagamentoRepository = pagamentoRepository;
        this.pagamentoMapper = pagamentoMapper; // <-- Inicializar
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagamentoResponseDto> findAll() {
        log.info("Buscando todos os pagamentos");
        return pagamentoRepository.findAll().stream()
                .map(pagamentoMapper::toResponseDto) // <-- Usar Mapper
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PagamentoResponseDto findById(Long id) {
        log.info("Buscando pagamento por ID: {}", id);
        Pagamento pagamento = findPagamentoById(id);
        return pagamentoMapper.toResponseDto(pagamento); // <-- Usar Mapper
    }

    @Override
    @Transactional
    public PagamentoResponseDto create(PagamentoRequestDto pagamentoDto) {
        log.info("Criando novo pagamento");
        // Adicionar lógica de cálculo se necessário
        try {
            Pagamento pagamento = pagamentoMapper.toEntity(pagamentoDto); // <-- Usar Mapper
            Pagamento savedPagamento = pagamentoRepository.save(pagamento);
            log.info("Pagamento criado com ID: {}", savedPagamento.getId());
            return pagamentoMapper.toResponseDto(savedPagamento); // <-- Usar Mapper
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
        pagamentoMapper.updateEntityFromDto(pagamentoDto, existingPagamento); // <-- Usar Mapper
        // Recalcular campos se necessário
        Pagamento updatedPagamento = pagamentoRepository.save(existingPagamento);
        log.info("Pagamento atualizado com ID: {}", updatedPagamento.getId());
        return pagamentoMapper.toResponseDto(updatedPagamento); // <-- Usar Mapper
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        log.info("Deletando pagamento com ID: {}", id);
        Pagamento pagamento = findPagamentoById(id); // Verifica existência
        try {
            pagamentoRepository.delete(pagamento);
            log.info("Pagamento deletado com ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar pagamento com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao deletar pagamento com ID: " + id, e);
        }
    }

    // --- Método auxiliar ---
    private Pagamento findPagamentoById(Long id) {
        return pagamentoRepository.findById(id)
                .orElseThrow(() -> new PagamentoNotFoundException("Pagamento não encontrado com ID: " + id));
    }

    // REMOVER os métodos manuais de mapeamento:
    // mapEntityToResponseDto(Pagamento entity)
    // mapRequestDtoToEntity(PagamentoRequestDto dto)
    // updateEntityFromDto(Pagamento entity, PagamentoRequestDto dto)
}