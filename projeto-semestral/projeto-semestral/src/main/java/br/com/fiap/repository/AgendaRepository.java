// src/main/java/br/com/fiap/repository/AgendaRepository.java
package br.com.fiap.repository;

import br.com.fiap.dto.relatorio.ContagemMensalResultadoNativo;
import br.com.fiap.dto.relatorio.HistoricoAgendamentoClienteDTO;
import br.com.fiap.dto.relatorio.ServicoAgendadoDTO;
import br.com.fiap.model.Agenda;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface AgendaRepository extends JpaRepository<Agenda, Long>, JpaSpecificationExecutor<Agenda> {

    Page<Agenda> findByObservacaoContainingIgnoreCase(String observacao, Pageable pageable);

    // Query Nativa não é afetada por comentários Java
    @Query(value = "SELECT TO_CHAR(a.DATA_AGENDAMENTO, 'YYYY-MM') as mesAno, COUNT(a.ID_AGE) as quantidade FROM AGENDAR a GROUP BY TO_CHAR(a.DATA_AGENDAMENTO, 'YYYY-MM') ORDER BY mesAno DESC", nativeQuery = true)
    List<ContagemMensalResultadoNativo> countAgendamentosByMonthNative();

    // Query JPQL para Histórico (sem comentários internos)
    @Query("""
           SELECT new br.com.fiap.dto.relatorio.HistoricoAgendamentoClienteDTO(
               a.dataAgendamento,
               a.observacao,
               v.placa
           )
           FROM Agenda a
           JOIN a.agendaVeiculos av
           JOIN av.veiculo v
           JOIN v.clienteVeiculos cv
           WHERE cv.cliente.id.idCli = :idCliente AND cv.cliente.id.enderecoId = :idEndereco
           ORDER BY a.dataAgendamento DESC
           """)
    List<HistoricoAgendamentoClienteDTO> findHistoricoAgendamentosByClienteId(
            @Param("idCliente") Long idCliente,
            @Param("idEndereco") Long idEndereco
    );

    /**
     * Busca uma página de serviços agendados a partir de uma data inicial,
     * incluindo informações do veículo e diagnóstico da oficina, se disponíveis.
     *
     * @param dataInicio Data inicial para a busca (inclusive). Se null, busca todos os agendamentos.
     * @param pageable   Informações de paginação e ordenação.
     * @return Uma página (Page) de ServicoAgendadoDTO.
     */
    // Query JPQL para Serviços Agendados (sem comentários internos)
    @Query("""
            SELECT new br.com.fiap.dto.relatorio.ServicoAgendadoDTO(
                a.id,
                a.dataAgendamento,
                a.observacao,
                v.placa,
                o.descricaoProblema,
                o.diagnostico
            )
            FROM Agenda a
            LEFT JOIN a.agendaVeiculos av LEFT JOIN av.veiculo v
            LEFT JOIN a.agendaOficinas ao LEFT JOIN ao.oficina o
            WHERE (:dataInicio IS NULL OR a.dataAgendamento >= :dataInicio)
            """)
    Page<ServicoAgendadoDTO> findServicosAgendados(
            @Param("dataInicio") LocalDate dataInicio,
            Pageable pageable
    );
}