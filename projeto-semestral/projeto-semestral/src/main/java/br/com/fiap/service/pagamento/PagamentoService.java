package br.com.fiap.service.pagamento;

import br.com.fiap.dto.pagamento.PagamentoRequestDto;
import br.com.fiap.dto.pagamento.PagamentoResponseDto;
import org.springframework.data.domain.Page;     // <<< IMPORT Page
import org.springframework.data.domain.Pageable; // <<< IMPORT Pageable
import java.math.BigDecimal; // <<< IMPORT BigDecimal
import java.time.LocalDate;  // <<< IMPORT LocalDate
import java.util.List;

public interface PagamentoService {

    // Métodos CRUD existentes
    List<PagamentoResponseDto> listarTodos(); // Mantém para listagem simples sem paginação/filtro se útil
    PagamentoResponseDto buscarPorId(Long id);
    PagamentoResponseDto cadastrar(PagamentoRequestDto dto);
    PagamentoResponseDto alterar(Long id, PagamentoRequestDto dto);
    void deletar(Long id);

    // --- NOVO MÉTODO PARA BUSCA COM FILTROS E PAGINAÇÃO ---
    Page<PagamentoResponseDto> findWithFilters(
            LocalDate dataInicio,
            LocalDate dataFim,
            String tipoPagamento,
            BigDecimal valorMin,
            BigDecimal valorMax,
            Long clienteId,     // Filtro opcional por Cliente
            Long orcamentoId,   // Filtro opcional por Orcamento
            Pageable pageable   // Para paginação e ordenação
    );
    // ------------------------------------------------------
}