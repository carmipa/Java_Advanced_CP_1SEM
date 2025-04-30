// src/main/java/br/com/fiap/Controller/PagamentoController.java
package br.com.fiap.controller;

import br.com.fiap.dto.pagamento.PagamentoRequestDto;
import br.com.fiap.dto.pagamento.PagamentoResponseDto;
import br.com.fiap.exception.PagamentoNotFoundException;
import br.com.fiap.service.pagamento.PagamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter; // <<< Importar
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag; // <<< Importar
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/pagamento")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Pagamentos", description = "Operações relacionadas a pagamentos") // <<< TAG ADICIONADA
public class PagamentoController {

    private static final Logger log = LoggerFactory.getLogger(PagamentoController.class);
    @Autowired
    private PagamentoService pagamentoService;

    @GetMapping("/all")
    @Cacheable("pagamentos")
    @Operation(summary = "Listar Todos os Pagamentos", description = "Retorna uma lista de todos os pagamentos registrados.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de pagamentos retornada"),
            @ApiResponse(responseCode = "204", description = "Nenhum pagamento encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<List<PagamentoResponseDto>> findAll() {
        log.info("Requisição para listar todos os pagamentos");
        List<PagamentoResponseDto> pagamentos = pagamentoService.findAll();
        if (pagamentos.isEmpty()) { return ResponseEntity.noContent().build(); }
        return ResponseEntity.ok(pagamentos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Pagamento por ID", description = "Retorna um pagamento específico pelo seu ID.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pagamento encontrado"),
            @ApiResponse(responseCode = "404", description = "Pagamento não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<PagamentoResponseDto> findById(
            @Parameter(description = "ID do pagamento a ser buscado") @PathVariable Long id // <<< @Parameter
    ) {
        log.info("Requisição para buscar pagamento por ID: {}", id);
        try {
            PagamentoResponseDto pagamento = pagamentoService.findById(id);
            return ResponseEntity.ok(pagamento);
        } catch (PagamentoNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar pagamento ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @CacheEvict(value = "pagamentos", allEntries = true)
    @Operation(summary = "Criar Novo Pagamento", description = "Cria um novo registro de pagamento.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Pagamento criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar criar o pagamento")
    })
    public ResponseEntity<PagamentoResponseDto> create(
            @Parameter(description = "Dados do pagamento para criação") @RequestBody @Valid PagamentoRequestDto pagamentoDto // <<< @Parameter
    ) {
        log.info("Requisição para criar novo pagamento: {}", pagamentoDto.getTipoPagamento());
        try {
            PagamentoResponseDto savedPagamento = pagamentoService.create(pagamentoDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPagamento);
        } catch (Exception e) {
            log.error("Erro ao criar pagamento: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @CacheEvict(value = "pagamentos", allEntries = true)
    @Operation(summary = "Atualizar Pagamento", description = "Atualiza um pagamento existente.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pagamento atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "404", description = "Pagamento não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar atualizar")
    })
    public ResponseEntity<PagamentoResponseDto> update(
            @Parameter(description = "ID do pagamento a ser atualizado") @PathVariable Long id, // <<< @Parameter
            @Parameter(description = "Dados atualizados do pagamento") @RequestBody @Valid PagamentoRequestDto pagamentoDto // <<< @Parameter
    ) {
        log.info("Requisição para atualizar pagamento ID: {}", id);
        try {
            PagamentoResponseDto updatedPagamento = pagamentoService.update(id, pagamentoDto);
            return ResponseEntity.ok(updatedPagamento);
        } catch (PagamentoNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar pagamento ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = "pagamentos", allEntries = true)
    @Operation(summary = "Deletar Pagamento", description = "Remove um pagamento.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Pagamento deletado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Pagamento não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar deletar")
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do pagamento a ser deletado") @PathVariable Long id // <<< @Parameter
    ) {
        log.info("Requisição para deletar pagamento ID: {}", id);
        try {
            pagamentoService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (PagamentoNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao deletar pagamento ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}