// src/main/java/br/com/fiap/Controller/RelatorioController.java
package br.com.fiap.controller;

import br.com.fiap.dto.relatorio.ContagemMensalDTO;
import br.com.fiap.dto.relatorio.HistoricoAgendamentoClienteDTO;
import br.com.fiap.dto.relatorio.ServicoAgendadoDTO;
import br.com.fiap.exception.ClientesNotFoundException;
import br.com.fiap.model.relacionamentos.ClienteId;
import br.com.fiap.service.relatorio.RelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/rest/relatorios")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Relatórios", description = "Endpoints para geração de relatórios específicos") // Descrição ajustada
public class RelatorioController {

    private static final Logger log = LoggerFactory.getLogger(RelatorioController.class);
    @Autowired
    private RelatorioService relatorioService;

    @GetMapping("/contagem-agendamentos-mensal")
    @Operation(summary = "Relatório: Contagem Mensal de Agendamentos", description = "Retorna a quantidade total de agendamentos agrupados por mês/ano (formato YYYY-MM).") // Ajustado
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contagem retornada com sucesso"),
            @ApiResponse(responseCode = "204", description = "Nenhum agendamento encontrado no período"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao gerar relatório")
    })
    public ResponseEntity<List<ContagemMensalDTO>> getContagemMensal() {
        log.info("Requisição GET /rest/relatorios/contagem-agendamentos-mensal");
        try {
            List<ContagemMensalDTO> contagem = relatorioService.getContagemMensalAgendamentos();
            if (contagem.isEmpty()) { return ResponseEntity.noContent().build(); }
            return ResponseEntity.ok(contagem);
        } catch (Exception e) {
            log.error("Erro ao gerar relatório de contagem mensal: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/historico-cliente/{idCliente}/{idEndereco}")
    @Operation(summary = "Relatório: Histórico de Agendamentos por Cliente", description = "Retorna a lista de agendamentos (data, observação, placa) associados aos veículos de um cliente específico, identificado pelo ID composto.") // Ajustado
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Histórico retornado com sucesso"),
            @ApiResponse(responseCode = "204", description = "Nenhum histórico encontrado para o cliente"),
            @ApiResponse(responseCode = "400", description = "ID composto do cliente inválido"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado com o ID composto fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao gerar histórico")
    })
    public ResponseEntity<List<HistoricoAgendamentoClienteDTO>> getHistoricoCliente(
            @Parameter(description = "ID numérico do cliente (ID_CLI)") @PathVariable Long idCliente,
            @Parameter(description = "ID do endereço associado ao cliente (ENDERECOS_ID_END)") @PathVariable Long idEndereco
    ) {
        ClienteId clienteId = new ClienteId(idCliente, idEndereco);
        log.info("Requisição GET /rest/relatorios/historico-cliente/{}", clienteId);
        try {
            List<HistoricoAgendamentoClienteDTO> historico = relatorioService.getHistoricoAgendamentosCliente(clienteId);
            if (historico.isEmpty()) { return ResponseEntity.noContent().build(); }
            return ResponseEntity.ok(historico);
        } catch (ClientesNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao gerar histórico para cliente {}: {}", clienteId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/servicos-agendados")
    @Operation(summary = "Relatório: Serviços Agendados", description = "Retorna uma lista paginada de agendamentos a partir de uma data, com detalhes do veículo e diagnóstico da oficina (se associados).") // Ajustado
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Página de serviços agendados retornada"),
            @ApiResponse(responseCode = "204", description = "Nenhum serviço agendado encontrado a partir da data"),
            @ApiResponse(responseCode = "400", description = "Parâmetros de data ou paginação inválidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao gerar relatório")
    })
    public ResponseEntity<Page<ServicoAgendadoDTO>> getServicosAgendados(
            @Parameter(description = "Data inicial (YYYY-MM-DD) para buscar agendamentos (inclusive). Se omitido, usa a data atual.") // Ajustado
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(hidden = true) Pageable pageable
    ) {
        LocalDate dataInicioFiltro = (dataInicio != null) ? dataInicio : LocalDate.now();
        log.info("Requisição GET /rest/relatorios/servicos-agendados: dataInicio={}, pageable={}", dataInicioFiltro, pageable);
        try {
            Page<ServicoAgendadoDTO> paginaServicos = relatorioService.findServicosAgendados(dataInicioFiltro, pageable);
            if (paginaServicos.isEmpty()) { return ResponseEntity.noContent().build(); }
            return ResponseEntity.ok(paginaServicos);
        } catch (Exception e) {
            log.error("Erro ao gerar relatório de serviços agendados a partir de {}: {}", dataInicioFiltro, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}