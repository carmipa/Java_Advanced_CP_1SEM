package br.com.fiap.service.pagamento; // Ou br.com.fiap.service.pagamento.impl

import br.com.fiap.dto.pagamento.PagamentoRequestDto;
import br.com.fiap.dto.pagamento.PagamentoResponseDto;
import br.com.fiap.exception.PagamentoNotFoundException;
import br.com.fiap.mapper.PagamentoMapper; // <<< IMPORTAR O MAPPER
import br.com.fiap.model.Pagamento;
import br.com.fiap.repository.PagamentoRepository;
// Remova jakarta.persistence.EntityNotFoundException se PagamentoNotFoundException for sempre usada
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import br.com.fiap.repository.specification.PagamentoSpecification; // Para o método findWithFilters

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PagamentoServiceImpl implements PagamentoService {

    private static final Logger log = LoggerFactory.getLogger(PagamentoServiceImpl.class);
    private static final BigDecimal CEM = new BigDecimal("100");
    private static final int DEFAULT_SCALE = 2;
    private static final RoundingMode DEFAULT_ROUNDING_MODE = RoundingMode.HALF_UP;

    @Autowired
    private PagamentoRepository pagamentoRepository;

    @Autowired
    private PagamentoMapper pagamentoMapper; // <<< INJETAR O MAPPER

    @Override
    @Transactional(readOnly = true)
    public List<PagamentoResponseDto> listarTodos() {
        log.info("Listando todos os pagamentos (sem filtros/paginação)");
        return pagamentoRepository.findAll().stream()
                .map(pagamentoMapper::toResponseDto) // Usa o mapper
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PagamentoResponseDto buscarPorId(Long id) {
        log.info("Buscando pagamento com ID: {}", id);
        return pagamentoMapper.toResponseDto(findPagamentoByIdOrElseThrow(id)); // Usa o mapper
    }

    @Override
    @Transactional
    public PagamentoResponseDto cadastrar(PagamentoRequestDto dto) {
        log.info("Cadastrando novo pagamento...");
        // Mapeamento básico dos campos que coincidem ou foram explicitamente mapeados no PagamentoMapper
        Pagamento pagamento = pagamentoMapper.toEntity(dto);

        // Agora, aplicamos a lógica de cálculo para os campos que foram ignorados pelo mapper
        // ou que dependem de outros valores do DTO.
        calculateAndSetDerivedValues(pagamento, dto.getValorServico(), dto.getDescontoPercentual(), dto.getTotalParcelas());

        // Lógica para associar com Cliente/Orçamento (se necessário)...

        Pagamento pagamentoSalvo = pagamentoRepository.save(pagamento);
        log.info("Pagamento cadastrado com sucesso com ID: {}", pagamentoSalvo.getId());
        return pagamentoMapper.toResponseDto(pagamentoSalvo); // Usa o mapper
    }

    @Override
    @Transactional
    public PagamentoResponseDto alterar(Long id, PagamentoRequestDto dto) {
        log.info("Alterando pagamento com ID: {}", id);
        Pagamento pagamento = findPagamentoByIdOrElseThrow(id);

        // Atualiza os campos básicos usando o mapper
        // O PagamentoMapper.updateEntityFromDto já ignora o ID e os campos calculados
        pagamentoMapper.updateEntityFromDto(dto, pagamento);

        // Recalcula os valores derivados
        calculateAndSetDerivedValues(pagamento, dto.getValorServico(), dto.getDescontoPercentual(), dto.getTotalParcelas());

        // Lógica para atualizar associações (se necessário)...

        Pagamento pagamentoAtualizado = pagamentoRepository.save(pagamento);
        log.info("Pagamento ID: {} alterado com sucesso.", id);
        return pagamentoMapper.toResponseDto(pagamentoAtualizado); // Usa o mapper
    }

    @Override
    @Transactional
    public void deletar(Long id) {
        log.info("Deletando pagamento com ID: {}", id);
        if (!pagamentoRepository.existsById(id)) {
            throw new PagamentoNotFoundException("Pagamento não encontrado para exclusão com ID: " + id);
        }
        pagamentoRepository.deleteById(id);
        log.info("Pagamento ID: {} deletado com sucesso.", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PagamentoResponseDto> findWithFilters(
            LocalDate dataInicio, LocalDate dataFim, String tipoPagamento,
            BigDecimal valorMin, BigDecimal valorMax, Long clienteId,
            Long orcamentoId, Pageable pageable)
    {
        log.info("Buscando pagamentos com filtros: dataInicio={}, dataFim={}, tipo={}, valorMin={}, valorMax={}, clienteId={}, orcamentoId={}, pageable={}",
                dataInicio, dataFim, tipoPagamento, valorMin, valorMax, clienteId, orcamentoId, pageable);

        Specification<Pagamento> spec = Specification.where(null);
        if (dataInicio != null) spec = spec.and(PagamentoSpecification.dataPagamentoMaiorOuIgualA(dataInicio));
        if (dataFim != null) spec = spec.and(PagamentoSpecification.dataPagamentoMenorOuIgualA(dataFim));
        if (StringUtils.hasText(tipoPagamento)) spec = spec.and(PagamentoSpecification.tipoPagamentoIgual(tipoPagamento));
        if (valorMin != null) spec = spec.and(PagamentoSpecification.totalComDescontoMaiorOuIgualA(valorMin));
        if (valorMax != null) spec = spec.and(PagamentoSpecification.totalComDescontoMenorOuIgualA(valorMax));
        if (clienteId != null && clienteId > 0) spec = spec.and(PagamentoSpecification.associadoAoCliente(clienteId));
        if (orcamentoId != null && orcamentoId > 0) spec = spec.and(PagamentoSpecification.associadoAoOrcamento(orcamentoId));

        Page<Pagamento> paginaPagamentos = pagamentoRepository.findAll(spec, pageable);
        log.info("Encontrados {} pagamentos na página {}/{} para os filtros aplicados.",
                paginaPagamentos.getNumberOfElements(), pageable.getPageNumber(), paginaPagamentos.getTotalPages());
        return paginaPagamentos.map(pagamentoMapper::toResponseDto); // Usa o mapper
    }

    // --- Métodos Auxiliares ---
    private Pagamento findPagamentoByIdOrElseThrow(Long id) {
        return pagamentoRepository.findById(id)
                .orElseThrow(() -> new PagamentoNotFoundException("Pagamento não encontrado com ID: " + id));
    }

    // Este método de conversão para DTO de resposta agora pode ser substituído pelo mapper
    // Se o mapeamento for direto e simples, senão, mantenha-o para lógica customizada.
    // private PagamentoResponseDto convertToResponseDto(Pagamento pagamento) {
    //     if (pagamento == null) return null;
    //     return pagamentoMapper.toResponseDto(pagamento);
    // }

    // Método centralizado para calcular os valores que o mapper ignorou
    private void calculateAndSetDerivedValues(Pagamento pagamento, BigDecimal valorServico,
                                              BigDecimal descontoPercentualInput, Integer totalParcelasInput) {

        // O mapper já deve ter setado:
        // pagamento.setDataPagamento(dto.getDataPagamento());
        // pagamento.setTipoPagamento(dto.getTipoPagamento());
        // pagamento.setDesconto(descontoPercentualInput); // Armazena %
        // pagamento.setTotalParcelas(String.valueOf(totalParcelasInput)); // O mapper já fez a conversão Integer para String

        BigDecimal descontoPercentual = pagamento.getDesconto(); // Pega o que o mapper passou
        Integer totalParcelasInt;
        try {
            totalParcelasInt = Integer.parseInt(pagamento.getTotalParcelas());
        } catch (NumberFormatException e) {
            log.warn("Total de parcelas inválido na entidade: '{}'. Usando 1.", pagamento.getTotalParcelas());
            totalParcelasInt = 1;
            pagamento.setTotalParcelas("1"); // Corrige na entidade também
        }
        if (totalParcelasInt < 1) totalParcelasInt = 1;


        BigDecimal totalComDescontoCalculado;
        BigDecimal valorParcelaCalculado;

        if (valorServico != null && valorServico.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal fatorDesconto = BigDecimal.ONE.subtract(
                    descontoPercentual.divide(CEM, 4, DEFAULT_ROUNDING_MODE)
            );
            totalComDescontoCalculado = valorServico.multiply(fatorDesconto)
                    .setScale(DEFAULT_SCALE, DEFAULT_ROUNDING_MODE);
            valorParcelaCalculado = totalComDescontoCalculado.divide(
                    BigDecimal.valueOf(totalParcelasInt), DEFAULT_SCALE, DEFAULT_ROUNDING_MODE
            );
        } else {
            totalComDescontoCalculado = BigDecimal.ZERO.setScale(DEFAULT_SCALE, DEFAULT_ROUNDING_MODE);
            valorParcelaCalculado = BigDecimal.ZERO.setScale(DEFAULT_SCALE, DEFAULT_ROUNDING_MODE);
        }
        pagamento.setTotalComDesconto(totalComDescontoCalculado);
        pagamento.setValorParcelas(valorParcelaCalculado);
    }
}