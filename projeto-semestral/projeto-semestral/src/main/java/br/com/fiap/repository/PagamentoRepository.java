// br/com/fiap/repository/PagamentoRepository.java
package br.com.fiap.repository;

import br.com.fiap.dto.relatorio.PagamentoPorTipoDto;
import br.com.fiap.model.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Long>, JpaSpecificationExecutor<Pagamento> {

    // Query para Estatísticas Gerais
    @Query("SELECT COUNT(p.id) as totalOperacoes, " +
            "SUM(p.totalComDesconto) as valorTotalArrecadado, " +
            "AVG(p.totalComDesconto) as ticketMedio " +
            "FROM Pagamento p WHERE p.dataPagamento BETWEEN :dataInicio AND :dataFim")
    List<Object[]> getEstatisticasPagamentos(@Param("dataInicio") LocalDate dataInicio, @Param("dataFim") LocalDate dataFim);


    // Query para Pagamentos por Tipo
    @Query("SELECT new br.com.fiap.dto.relatorio.PagamentoPorTipoDto(p.tipoPagamento, COUNT(p.id), SUM(p.totalComDesconto)) " +
            "FROM Pagamento p WHERE p.dataPagamento BETWEEN :dataInicio AND :dataFim " +
            "GROUP BY p.tipoPagamento ORDER BY SUM(p.totalComDesconto) DESC")
    List<PagamentoPorTipoDto> findPagamentosAgrupadosPorTipo(@Param("dataInicio") LocalDate dataInicio, @Param("dataFim") LocalDate dataFim);

    // Query para Evolução Mensal do Valor
    // Oracle TO_CHAR para extrair 'YYYY-MM'
    @Query(value = "SELECT TO_CHAR(p.data_pagamento, 'YYYY-MM') as mesAno, SUM(p.total_pagamento_desconto) as valorTotal " +
            "FROM PAGAMENTOS p WHERE p.data_pagamento BETWEEN :dataInicio AND :dataFim " +
            "GROUP BY TO_CHAR(p.data_pagamento, 'YYYY-MM') ORDER BY mesAno ASC", nativeQuery = true)
    List<Object[]> findEvolucaoMensalValorPagamentosNativo(@Param("dataInicio") LocalDate dataInicio, @Param("dataFim") LocalDate dataFim); // <<< CORRETO: Retorna List<Object[]>
}