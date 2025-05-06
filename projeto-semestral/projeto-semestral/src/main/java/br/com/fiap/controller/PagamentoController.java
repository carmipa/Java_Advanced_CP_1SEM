package br.com.fiap.controller;

import br.com.fiap.dto.pagamento.PagamentoRequestDto;
import br.com.fiap.dto.pagamento.PagamentoResponseDto;
import br.com.fiap.exception.PagamentoNotFoundException;
import br.com.fiap.service.pagamento.PagamentoService;
import io.swagger.v3.oas.annotations.Operation;       // <<< IMPORT
import io.swagger.v3.oas.annotations.Parameter;      // <<< IMPORT
import io.swagger.v3.oas.annotations.media.Content;  // <<< IMPORT (para respostas com corpo)
import io.swagger.v3.oas.annotations.media.Schema;   // <<< IMPORT (para respostas com corpo)
import io.swagger.v3.oas.annotations.responses.ApiResponse; // <<< IMPORT
import io.swagger.v3.oas.annotations.responses.ApiResponses; // <<< IMPORT
import io.swagger.v3.oas.annotations.tags.Tag;           // <<< IMPORT
import jakarta.validation.Valid;
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
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDate;
import java.util.List; // Necessário se for manter o método listarTodos sem paginação

@RestController
@RequestMapping("/rest/pagamentos")
@CrossOrigin(origins = "*") // Ajuste em produção!
@Tag(name = "Pagamentos (Simulado)", description = "Operações para registro e consulta de pagamentos simulados (controle interno).") // <<< TAG
public class PagamentoController {

    private static final Logger log = LoggerFactory.getLogger(PagamentoController.class);

    @Autowired
    private PagamentoService pagamentoService;

    // --- GET /rest/pagamentos (COM FILTROS E PAGINAÇÃO) ---
    @GetMapping
    @Operation(summary = "Listar Pagamentos com Filtros e Paginação",
            description = "Retorna uma lista paginada de pagamentos, com opções de filtro por data, tipo, valor, cliente e orçamento. " +
                    "Parâmetros de paginação: ?page=0&size=10&sort=dataPagamento,desc")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de pagamentos retornada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class /* de PagamentoResponseDto */))),
            @ApiResponse(responseCode = "204", description = "Nenhum pagamento encontrado para os filtros aplicados"),
            @ApiResponse(responseCode = "400", description = "Parâmetros de filtro ou paginação inválidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<Page<PagamentoResponseDto>> listarPagamentosComFiltro(
            @Parameter(description = "Filtrar por data inicial do pagamento (formato AAAA-MM-DD)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(description = "Filtrar por data final do pagamento (formato AAAA-MM-DD)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @Parameter(description = "Filtrar por tipo de pagamento (ex: 'pix', 'credito')")
            @RequestParam(required = false) String tipoPagamento,
            @Parameter(description = "Filtrar por valor mínimo do pagamento (total com desconto)")
            @RequestParam(required = false) BigDecimal valorMin,
            @Parameter(description = "Filtrar por valor máximo do pagamento (total com desconto)")
            @RequestParam(required = false) BigDecimal valorMax,
            @Parameter(description = "ID do cliente para filtrar pagamentos associados")
            @RequestParam(required = false) Long clienteId,
            @Parameter(description = "ID do orçamento para filtrar pagamentos associados")
            @RequestParam(required = false) Long orcamentoId,
            @Parameter(hidden = true) // Pageable é injetado, não precisa aparecer na UI do Swagger como parâmetro manual
            Pageable pageable
    ) {
        log.info("Requisição GET /rest/pagamentos com filtros e paginação recebida.");
        try {
            Page<PagamentoResponseDto> paginaPagamentos = pagamentoService.findWithFilters(
                    dataInicio, dataFim, tipoPagamento, valorMin, valorMax,
                    clienteId, orcamentoId, pageable
            );

            if (paginaPagamentos.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(paginaPagamentos);

        } catch (IllegalArgumentException e) {
            log.warn("Argumento inválido na busca de pagamentos: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            log.error("Erro interno ao buscar pagamentos com filtros: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar pagamentos.");
        }
    }

    // --- GET /rest/pagamentos/{id} (Buscar por ID) ---
    @GetMapping("/{id}")
    @Operation(summary = "Buscar Pagamento por ID", description = "Retorna um pagamento específico pelo seu ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pagamento encontrado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = PagamentoResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Pagamento não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<PagamentoResponseDto> buscarPagamentoPorId(
            @Parameter(description = "ID do pagamento a ser buscado", required = true, example = "1") @PathVariable Long id
    ) {
        log.info("Requisição GET /rest/pagamentos/{}", id);
        PagamentoResponseDto pagamento = pagamentoService.buscarPorId(id); // Lança PagamentoNotFoundException se não achar
        log.info("Pagamento ID {} encontrado.", id);
        return ResponseEntity.ok(pagamento);
    }

    // --- POST /rest/pagamentos (Cadastrar novo) ---
    @PostMapping
    @Operation(summary = "Registrar Novo Pagamento", description = "Cria um novo registro de pagamento simulado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Pagamento registrado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = PagamentoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos para o registro do pagamento"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar registrar o pagamento")
    })
    public ResponseEntity<PagamentoResponseDto> cadastrarPagamento(
            @Parameter(description = "Dados do pagamento para registro", required = true,
                    schema = @Schema(implementation = PagamentoRequestDto.class))
            @Valid @RequestBody PagamentoRequestDto dto
    ) {
        log.info("Requisição POST /rest/pagamentos");
        try {
            PagamentoResponseDto pagamentoSalvo = pagamentoService.cadastrar(dto);
            log.info("Pagamento cadastrado com ID: {}", pagamentoSalvo.getId());
            URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                    .buildAndExpand(pagamentoSalvo.getId()).toUri();
            return ResponseEntity.created(location).body(pagamentoSalvo);
        } catch (Exception e) {
            log.error("Erro interno ao cadastrar pagamento: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao processar o cadastro do pagamento.");
        }
    }

    // --- PUT /rest/pagamentos/{id} (Alterar existente) ---
    @PutMapping("/{id}")
    @Operation(summary = "Alterar Registro de Pagamento", description = "Atualiza um registro de pagamento existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registro de pagamento atualizado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = PagamentoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos para atualização"),
            @ApiResponse(responseCode = "404", description = "Registro de pagamento não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar atualizar o registro")
    })
    public ResponseEntity<PagamentoResponseDto> alterarPagamento(
            @Parameter(description = "ID do pagamento a ser alterado", required = true, example = "1") @PathVariable Long id,
            @Parameter(description = "Dados atualizados do pagamento", required = true,
                    schema = @Schema(implementation = PagamentoRequestDto.class))
            @Valid @RequestBody PagamentoRequestDto dto
    ) {
        log.info("Requisição PUT /rest/pagamentos/{}", id);
        try {
            PagamentoResponseDto pagamentoAtualizado = pagamentoService.alterar(id, dto);
            log.info("Pagamento ID {} alterado.", id);
            return ResponseEntity.ok(pagamentoAtualizado);
        } catch (PagamentoNotFoundException e) { // Captura específica para log
            log.warn("Pagamento não encontrado para alteração com ID: {}", id);
            throw e; // Relança para ser tratado pelo @ResponseStatus da exceção
        } catch (Exception e) {
            log.error("Erro interno ao alterar pagamento {}: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao processar a alteração do pagamento.");
        }
    }

    // --- DELETE /rest/pagamentos/{id} (Deletar) ---
    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar Registro de Pagamento", description = "Remove um registro de pagamento existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Registro de pagamento deletado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Registro de pagamento não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar deletar o registro")
            // @ApiResponse(responseCode = "409", description = "Conflito de integridade, pagamento associado a outros registros") // Se tratar DataIntegrityViolationException
    })
    public ResponseEntity<Void> deletarPagamento(
            @Parameter(description = "ID do pagamento a ser deletado", required = true, example = "1") @PathVariable Long id
    ) {
        log.info("Requisição DELETE /rest/pagamentos/{}", id);
        try {
            pagamentoService.deletar(id); // Lança PagamentoNotFoundException se não achar
            log.info("Pagamento ID {} deletado.", id);
            return ResponseEntity.noContent().build();
        } catch (PagamentoNotFoundException e) { // Captura específica para log
            log.warn("Pagamento não encontrado para exclusão com ID: {}", id);
            throw e; // Relança para ser tratado pelo @ResponseStatus da exceção
        } catch (Exception e) {
            log.error("Erro interno ao deletar pagamento {}: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao processar a exclusão do pagamento.");
        }
    }
}