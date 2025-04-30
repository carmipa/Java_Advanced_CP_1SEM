// src/main/java/br/com/fiap/Controller/PecasController.java
package br.com.fiap.controller;

import br.com.fiap.dto.pecas.PecasRequestDto;
import br.com.fiap.dto.pecas.PecasResponseDto;
import br.com.fiap.exception.PecasNotFoundException;
import br.com.fiap.service.pecas.PecasService;
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
@RequestMapping("/rest/pecas")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Peças", description = "Operações relacionadas a peças de veículos") // <<< TAG ADICIONADA
public class PecasController {

    private static final Logger log = LoggerFactory.getLogger(PecasController.class);
    @Autowired
    private PecasService pecasService;

    @GetMapping("/all")
    @Cacheable("pecas")
    @Operation(summary = "Listar Todas as Peças", description = "Retorna uma lista de todas as peças cadastradas.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de peças retornada"),
            @ApiResponse(responseCode = "204", description = "Nenhuma peça encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<List<PecasResponseDto>> findAll() {
        log.info("Requisição para listar todas as peças");
        List<PecasResponseDto> pecas = pecasService.findAll();
        if (pecas.isEmpty()) { return ResponseEntity.noContent().build(); }
        return ResponseEntity.ok(pecas);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Peça por ID", description = "Retorna uma peça específica pelo seu ID.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Peça encontrada"),
            @ApiResponse(responseCode = "404", description = "Peça não encontrada para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<PecasResponseDto> findById(
            @Parameter(description = "ID da peça a ser buscada") @PathVariable Long id // <<< @Parameter
    ) {
        log.info("Requisição para buscar peça por ID: {}", id);
        try {
            PecasResponseDto peca = pecasService.findById(id);
            return ResponseEntity.ok(peca);
        } catch (PecasNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar peça ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @CacheEvict(value = "pecas", allEntries = true)
    @Operation(summary = "Criar Nova Peça", description = "Cria um novo registro de peça.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Peça criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar criar a peça")
    })
    public ResponseEntity<PecasResponseDto> create(
            @Parameter(description = "Dados da peça para criação") @RequestBody @Valid PecasRequestDto pecasDto // <<< @Parameter
    ) {
        log.info("Requisição para criar nova peça: {}", pecasDto.getDescricao());
        try {
            PecasResponseDto savedPeca = pecasService.create(pecasDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPeca);
        } catch (Exception e) {
            log.error("Erro ao criar peça: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @CacheEvict(value = "pecas", allEntries = true)
    @Operation(summary = "Atualizar Peça", description = "Atualiza uma peça existente.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Peça atualizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "404", description = "Peça não encontrada para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar atualizar")
    })
    public ResponseEntity<PecasResponseDto> update(
            @Parameter(description = "ID da peça a ser atualizada") @PathVariable Long id, // <<< @Parameter
            @Parameter(description = "Dados atualizados da peça") @RequestBody @Valid PecasRequestDto pecasDto // <<< @Parameter
    ) {
        log.info("Requisição para atualizar peça ID: {}", id);
        try {
            PecasResponseDto updatedPeca = pecasService.update(id, pecasDto);
            return ResponseEntity.ok(updatedPeca);
        } catch (PecasNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar peça ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = "pecas", allEntries = true)
    @Operation(summary = "Deletar Peça", description = "Remove uma peça.") // Descrição
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Peça deletada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Peça não encontrada para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar deletar")
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID da peça a ser deletada") @PathVariable Long id // <<< @Parameter
    ) {
        log.info("Requisição para deletar peça ID: {}", id);
        try {
            pecasService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (PecasNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao deletar peça ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}