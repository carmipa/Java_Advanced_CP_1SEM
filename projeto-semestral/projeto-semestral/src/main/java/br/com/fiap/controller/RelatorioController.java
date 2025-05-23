// src/main/java/br/com/fiap/controller/RelatorioController.java
package br.com.fiap.controller;

// --- Imports NECESSÁRIOS ---
import br.com.fiap.dto.relatorio.*; // Importa todos os DTOs de relatório
import br.com.fiap.exception.ClientesNotFoundException;
import br.com.fiap.model.relacionamentos.ClienteId;
import br.com.fiap.service.relatorio.RelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/rest/relatorios")
// @CrossOrigin(origins = "http://localhost:3000") // REMOVIDO: A configuração global de CORS em SecurityConfig será usada
@Tag(name = "Relatórios", description = "Endpoints para geração de relatórios consolidados")
public class RelatorioController {

    private static final Logger log = LoggerFactory.getLogger(RelatorioController.class);
    @Autowired
    private RelatorioService relatorioService;

    // Endpoint Contagem Mensal (Existente)
    @GetMapping("/contagem-agendamentos-mensal")
    @Operation(summary = "Relatório de Contagem Mensal de Agendamentos", description = "Retorna a quantidade de agendamentos agrupados por mês/ano.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contagem retornada com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ContagemMensalDTO.class))),
            @ApiResponse(responseCode = "204", description = "Nenhum agendamento encontrado no período"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<List<ContagemMensalDTO>> getContagemMensal() {
        log.info("Requisição GET /rest/relatorios/contagem-agendamentos-mensal");
        try {
            List<ContagemMensalDTO> contagem = relatorioService.getContagemMensalAgendamentos();
            if (contagem.isEmpty()) { return ResponseEntity.noContent().build(); }
            return ResponseEntity.ok(contagem);
        } catch (Exception e) {
            log.error("Erro ao gerar relatório de contagem mensal: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint Histórico Cliente (Existente)
    @GetMapping("/historico-cliente/{idCliente}/{idEndereco}")
    @Operation(summary = "Histórico de Agendamentos por Cliente", description = "Retorna o histórico de agendamentos para um cliente específico.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Histórico retornado com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = HistoricoAgendamentoClienteDTO.class))),
            @ApiResponse(responseCode = "204", description = "Nenhum histórico encontrado para o cliente"),
            @ApiResponse(responseCode = "400", description = "IDs de cliente ou endereço inválidos"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<List<HistoricoAgendamentoClienteDTO>> getHistoricoCliente(
            @Parameter(description = "ID_CLI do cliente") @PathVariable Long idCliente,
            @Parameter(description = "ENDERECOS_ID_END do cliente") @PathVariable Long idEndereco
    ) {
        ClienteId clienteIdObj = new ClienteId(idCliente, idEndereco);
        log.info("Requisição GET /rest/relatorios/historico-cliente/{}", clienteIdObj);
        try {
            List<HistoricoAgendamentoClienteDTO> historico = relatorioService.getHistoricoAgendamentosCliente(clienteIdObj);
            if (historico.isEmpty()) { return ResponseEntity.noContent().build(); }
            return ResponseEntity.ok(historico);
        } catch (ClientesNotFoundException e) {
            log.warn("Cliente não encontrado para histórico: {}", clienteIdObj);
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            log.warn("ID inválido para histórico de cliente: {}: {}", clienteIdObj, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao gerar histórico para cliente {}: {}", clienteIdObj, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint Serviços Agendados (Existente)
    @GetMapping("/servicos-agendados")
    @Operation(summary = "Relatório de Serviços Agendados", description = "Lista os serviços agendados a partir de uma data, com detalhes do veículo e diagnóstico.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Serviços agendados retornados com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "204", description = "Nenhum serviço agendado encontrado para os critérios"),
            @ApiResponse(responseCode = "400", description = "Parâmetros de data ou paginação inválidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<Page<ServicoAgendadoDTO>> getServicosAgendados(
            @Parameter(description = "Data inicial (AAAA-MM-DD) para buscar serviços. Padrão: data atual.")
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
            log.error("Erro ao gerar relatório de serviços agendados: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- NOVOS ENDPOINTS PARA RELATÓRIOS DE PAGAMENTO ---

    @GetMapping("/pagamentos/estatisticas")
    @Operation(summary = "Estatísticas Gerais de Pagamentos", description = "Retorna o total de operações, valor total arrecadado e ticket médio dos pagamentos em um período.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estatísticas retornadas com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EstatisticasPagamentosDto.class))),
            @ApiResponse(responseCode = "400", description = "Parâmetros de data inválidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<EstatisticasPagamentosDto> getEstatisticasPagamentos(
            @Parameter(description = "Data inicial do período (AAAA-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(description = "Data final do período (AAAA-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        log.info("Requisição GET /rest/relatorios/pagamentos/estatisticas para período: {} a {}", dataInicio, dataFim);
        if (dataInicio == null || dataFim == null || dataFim.isBefore(dataInicio)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Datas de início e fim são obrigatórias e a data fim não pode ser anterior à data início.");
        }
        try {
            EstatisticasPagamentosDto estatisticas = relatorioService.getEstatisticasPagamentos(dataInicio, dataFim);
            return ResponseEntity.ok(estatisticas);
        } catch (Exception e) {
            log.error("Erro ao gerar estatísticas de pagamentos: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/pagamentos/por-tipo")
    @Operation(summary = "Pagamentos Agrupados por Tipo", description = "Retorna a quantidade e o valor total de pagamentos agrupados por forma de pagamento em um período.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dados retornados com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = PagamentoPorTipoDto.class))),
            @ApiResponse(responseCode = "204", description = "Nenhum pagamento encontrado no período"),
            @ApiResponse(responseCode = "400", description = "Parâmetros de data inválidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<List<PagamentoPorTipoDto>> getPagamentosPorTipo(
            @Parameter(description = "Data inicial do período (AAAA-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(description = "Data final do período (AAAA-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        log.info("Requisição GET /rest/relatorios/pagamentos/por-tipo para período: {} a {}", dataInicio, dataFim);
        if (dataInicio == null || dataFim == null || dataFim.isBefore(dataInicio)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Datas de início e fim são obrigatórias e a data fim não pode ser anterior à data início.");
        }
        try {
            List<PagamentoPorTipoDto> resultado = relatorioService.getPagamentosPorTipo(dataInicio, dataFim);
            if (resultado.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro ao gerar relatório de pagamentos por tipo: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/pagamentos/evolucao-mensal-valor")
    @Operation(summary = "Evolução Mensal do Valor dos Pagamentos", description = "Retorna o valor total de pagamentos agrupados por mês/ano em um período.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dados retornados com sucesso", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EvolucaoMensalValorDto.class))),
            @ApiResponse(responseCode = "204", description = "Nenhum pagamento encontrado no período"),
            @ApiResponse(responseCode = "400", description = "Parâmetros de data inválidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<List<EvolucaoMensalValorDto>> getEvolucaoMensalValorPagamentos(
            @Parameter(description = "Data inicial do período (AAAA-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(description = "Data final do período (AAAA-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        log.info("Requisição GET /rest/relatorios/pagamentos/evolucao-mensal-valor para período: {} a {}", dataInicio, dataFim);
        if (dataInicio == null || dataFim == null || dataFim.isBefore(dataInicio)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Datas de início e fim são obrigatórias e a data fim não pode ser anterior à data início.");
        }
        try {
            List<EvolucaoMensalValorDto> resultado = relatorioService.getEvolucaoMensalValorPagamentos(dataInicio, dataFim);
            if (resultado.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro ao gerar relatório de evolução mensal do valor dos pagamentos: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    // ----------------------------------------------------------
}