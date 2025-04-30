// src/main/java/br/com/fiap/Controller/RelatorioController.java
package br.com.fiap.Controller;

// --- Imports NECESSÁRIOS ---
// DTOs
import br.com.fiap.dto.relatorio.ContagemMensalDTO;
import br.com.fiap.dto.relatorio.HistoricoAgendamentoClienteDTO;
import br.com.fiap.dto.relatorio.ServicoAgendadoDTO; // << Import para Serviços Agendados
// Exceptions
import br.com.fiap.exception.ClientesNotFoundException;
// Models
import br.com.fiap.model.relacionamentos.ClienteId;
// Services
import br.com.fiap.service.relatorio.RelatorioService;
// Swagger / OpenAPI
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
// Logging
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
// Spring Core & Web
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;         // << Import para Page
import org.springframework.data.domain.Pageable;      // << Import para Pageable
import org.springframework.format.annotation.DateTimeFormat; // << Import para LocalDate @RequestParam
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;    // << Import para todas as anotações Web
// Java Util
import java.time.LocalDate;                         // << Import para LocalDate
import java.util.List;
// --- Fim Imports ---

@RestController
@RequestMapping("/rest/relatorios")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Relatórios", description = "Endpoints para geração de relatórios")
public class RelatorioController {

    private static final Logger log = LoggerFactory.getLogger(RelatorioController.class);

    @Autowired
    private RelatorioService relatorioService;

    // Endpoint Contagem Mensal
    @GetMapping("/contagem-agendamentos-mensal")
    @Operation(summary = "Relatório de Contagem Mensal")
    @ApiResponses(value = { @ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "204"), @ApiResponse(responseCode = "500") })
    public ResponseEntity<List<ContagemMensalDTO>> getContagemMensal() {
        log.info("Requisição GET /rest/relatorios/contagem-agendamentos-mensal");
        try {
            List<ContagemMensalDTO> contagem = relatorioService.getContagemMensalAgendamentos();
            if (contagem.isEmpty()) { return ResponseEntity.noContent().build(); }
            return ResponseEntity.ok(contagem);
        } catch (Exception e) {
            log.error("Erro: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint Histórico Cliente
    @GetMapping("/historico-cliente/{idCliente}/{idEndereco}")
    @Operation(summary = "Histórico de Agendamentos por Cliente")
    @ApiResponses(value = { @ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "204"), @ApiResponse(responseCode = "400"), @ApiResponse(responseCode = "404"), @ApiResponse(responseCode = "500") })
    public ResponseEntity<List<HistoricoAgendamentoClienteDTO>> getHistoricoCliente(
            @Parameter(description = "ID_CLI do cliente") @PathVariable Long idCliente,
            @Parameter(description = "ENDERECOS_ID_END do cliente") @PathVariable Long idEndereco
    ) {
        ClienteId clienteId = new ClienteId(idCliente, idEndereco);
        log.info("Requisição GET /rest/relatorios/historico-cliente/{}", clienteId);
        try {
            List<HistoricoAgendamentoClienteDTO> historico = relatorioService.getHistoricoAgendamentosCliente(clienteId);
            if (historico.isEmpty()) { return ResponseEntity.noContent().build(); }
            return ResponseEntity.ok(historico);
        } catch (ClientesNotFoundException e) {
            log.warn("Cliente não encontrado: {}", clienteId);
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            log.warn("ID inválido: {}: {}", clienteId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao gerar histórico: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint Serviços Agendados
    @GetMapping("/servicos-agendados")
    @Operation(summary = "Relatório de Serviços Agendados")
    @ApiResponses(value = { @ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "204"), @ApiResponse(responseCode = "400"), @ApiResponse(responseCode = "500") })
    public ResponseEntity<Page<ServicoAgendadoDTO>> getServicosAgendados(
            @Parameter(description = "Data inicial (AAAA-MM-DD). Padrão: hoje.")
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
            return ResponseEntity.internalServerError().build();
        }
    }
}