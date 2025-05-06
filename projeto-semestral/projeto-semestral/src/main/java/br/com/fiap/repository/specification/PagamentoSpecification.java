package br.com.fiap.repository.specification;

import br.com.fiap.model.Pagamento;
import br.com.fiap.model.relacionamentos.ClientePagamento; // Para join com Cliente
import br.com.fiap.model.relacionamentos.PagamentoOrcamento; // Para join com Orcamento
import jakarta.persistence.criteria.*; // Import para Criteria API (Join, Predicate, etc)
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils; // Helper do Spring para verificar strings

import java.math.BigDecimal;
import java.time.LocalDate;

public class PagamentoSpecification {

    // Construtor privado para evitar instanciação
    private PagamentoSpecification() {}

    /**
     * Cria Specification para filtrar por data de pagamento >= dataInicio.
     */
    public static Specification<Pagamento> dataPagamentoMaiorOuIgualA(LocalDate dataInicio) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(root.get("dataPagamento"), dataInicio);
        // "dataPagamento" é o nome do campo na entidade Pagamento
    }

    /**
     * Cria Specification para filtrar por data de pagamento <= dataFim.
     */
    public static Specification<Pagamento> dataPagamentoMenorOuIgualA(LocalDate dataFim) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(root.get("dataPagamento"), dataFim);
    }

    /**
     * Cria Specification para filtrar por tipo de pagamento (ignorando case).
     */
    public static Specification<Pagamento> tipoPagamentoIgual(String tipo) {
        return (root, query, criteriaBuilder) ->
                // Usar hasText para verificar se não é nulo ou vazio/branco
                StringUtils.hasText(tipo) ?
                        criteriaBuilder.equal(criteriaBuilder.lower(root.get("tipoPagamento")), tipo.toLowerCase())
                        : criteriaBuilder.conjunction(); // Retorna um predicado "verdadeiro" se tipo for nulo/vazio
    }

    /**
     * Cria Specification para filtrar por totalComDesconto >= valorMin.
     */
    public static Specification<Pagamento> totalComDescontoMaiorOuIgualA(BigDecimal valorMin) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(root.get("totalComDesconto"), valorMin);
    }

    /**
     * Cria Specification para filtrar por totalComDesconto <= valorMax.
     */
    public static Specification<Pagamento> totalComDescontoMenorOuIgualA(BigDecimal valorMax) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(root.get("totalComDesconto"), valorMax);
    }

    /**
     * Cria Specification para filtrar pagamentos associados a um Cliente específico.
     * Requer um JOIN com a entidade de relacionamento ClientePagamento.
     */
    public static Specification<Pagamento> associadoAoCliente(Long clienteId) {
        return (root, query, criteriaBuilder) -> {
            // Evita joins desnecessários se o critério não for aplicado
            query.distinct(true); // Garante resultados distintos caso um pagamento esteja ligado múltiplas vezes (improvável aqui, mas boa prática)
            // Faz o JOIN da entidade Pagamento (root) para a coleção clientePagamentos
            // e depois para a entidade Cliente dentro de ClientePagamento
            Join<Pagamento, ClientePagamento> clientePagamentoJoin = root.join("clientePagamentos", JoinType.INNER);
            // Filtra pelo ID do cliente (considerando a chave composta)
            // Assumindo que ClientePagamento tem um campo 'cliente' e Cliente tem 'id.idCli'
            return criteriaBuilder.equal(clientePagamentoJoin.get("cliente").get("id").get("idCli"), clienteId);
            // Ajuste os nomes "cliente", "id", "idCli" conforme sua entidade Cliente e ClientePagamento
        };
    }

    /**
     * Cria Specification para filtrar pagamentos associados a um Orcamento específico.
     * Requer um JOIN com a entidade de relacionamento PagamentoOrcamento.
     */
    public static Specification<Pagamento> associadoAoOrcamento(Long orcamentoId) {
        return (root, query, criteriaBuilder) -> {
            query.distinct(true);
            Join<Pagamento, PagamentoOrcamento> pagamentoOrcamentoJoin = root.join("pagamentoOrcamentos", JoinType.INNER);
            // Filtra pelo ID do orçamento
            // Assumindo que PagamentoOrcamento tem um campo 'orcamento' e Orcamento tem 'id'
            return criteriaBuilder.equal(pagamentoOrcamentoJoin.get("orcamento").get("id"), orcamentoId);
            // Ajuste os nomes "orcamento", "id" conforme sua entidade Orcamento e PagamentoOrcamento
        };
    }
}