// src/main/java/br/com/fiap/Controller/OrcamentoController.java
package br.com.fiap.controller;

import br.com.fiap.dto.orcamento.OrcamentoRequestDto;
import br.com.fiap.dto.orcamento.OrcamentoResponseDto;
import br.com.fiap.exception.OrcamentoNotFoundException;
import br.com.fiap.service.orcamento.OrcamentoService;
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
@RequestMapping("/rest/orcamento")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Orçamentos", description = "Operações relacionadas a orçamentos de serviços") // <<< TAG ADICIONADA
public class OrcamentoController {

    private static final Logger log = LoggerFactory.getLogger(OrcamentoController.class);
    @Autowired
    private OrcamentoService orcamentoService;

    @GetMapping("/all")
    @Cacheable("orcamentos")
    @Operation(summary = "Listar Todos os Orçamentos", description = "Retorna uma lista de todos os orçamentos cadastrados.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de orçamentos retornada"),
            @ApiResponse(responseCode = "204", description = "Nenhum orçamento encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<List<OrcamentoResponseDto>> findAll() {
        log.info("Requisição para listar todos os orçamentos");
        List<OrcamentoResponseDto> orcamentos = orcamentoService.findAll();
        if (orcamentos.isEmpty()) { return ResponseEntity.noContent().build(); }
        return ResponseEntity.ok(orcamentos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Orçamento por ID", description = "Retorna um orçamento específico pelo seu ID.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orçamento encontrado"),
            @ApiResponse(responseCode = "404", description = "Orçamento não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<OrcamentoResponseDto> findById(
            @Parameter(description = "ID do orçamento a ser buscado") @PathVariable Long id // <<< @Parameter
    ) {
        log.info("Requisição para buscar orçamento por ID: {}", id);
        try {
            OrcamentoResponseDto orcamento = orcamentoService.findById(id);
            return ResponseEntity.ok(orcamento);
        } catch (OrcamentoNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar orçamento ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @CacheEvict(value = "orcamentos", allEntries = true)
    @Operation(summary = "Criar Novo Orçamento", description = "Cria um novo registro de orçamento.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Orçamento criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar criar o orçamento")
    })
    public ResponseEntity<OrcamentoResponseDto> create(
            @Parameter(description = "Dados do orçamento para criação") @RequestBody @Valid OrcamentoRequestDto orcamentoDto // <<< @Parameter
    ) {
        log.info("Requisição para criar novo orçamento: {}", orcamentoDto.getDataOrcamento());
        try {
            OrcamentoResponseDto savedOrcamento = orcamentoService.create(orcamentoDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedOrcamento);
        } catch (Exception e) {
            log.error("Erro ao criar orçamento: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @CacheEvict(value = "orcamentos", allEntries = true)
    @Operation(summary = "Atualizar Orçamento", description = "Atualiza um orçamento existente.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orçamento atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "404", description = "Orçamento não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar atualizar")
    })
    public ResponseEntity<OrcamentoResponseDto> update(
            @Parameter(description = "ID do orçamento a ser atualizado") @PathVariable Long id, // <<< @Parameter
            @Parameter(description = "Dados atualizados do orçamento") @RequestBody @Valid OrcamentoRequestDto orcamentoDto // <<< @Parameter
    ) {
        log.info("Requisição para atualizar orçamento ID: {}", id);
        try {
            OrcamentoResponseDto updatedOrcamento = orcamentoService.update(id, orcamentoDto);
            return ResponseEntity.ok(updatedOrcamento);
        } catch (OrcamentoNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar orçamento ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = "orcamentos", allEntries = true)
    @Operation(summary = "Deletar Orçamento", description = "Remove um orçamento.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Orçamento deletado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Orçamento não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar deletar")
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do orçamento a ser deletado") @PathVariable Long id // <<< @Parameter
    ) {
        log.info("Requisição para deletar orçamento ID: {}", id);
        try {
            orcamentoService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (OrcamentoNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao deletar orçamento ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}