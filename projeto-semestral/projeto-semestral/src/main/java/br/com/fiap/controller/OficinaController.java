// src/main/java/br/com/fiap/Controller/OficinaController.java
package br.com.fiap.controller;

import br.com.fiap.dto.oficina.OficinaRequestDto;
import br.com.fiap.dto.oficina.OficinaResponseDto;
import br.com.fiap.exception.OficinaNotFoundException;
import br.com.fiap.service.oficina.OficinaService;
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
@RequestMapping("/rest/oficina")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Oficina (Diagnósticos)", description = "Operações relacionadas aos registros de diagnóstico da oficina") // <<< TAG ADICIONADA
public class OficinaController {

    private static final Logger log = LoggerFactory.getLogger(OficinaController.class);
    @Autowired
    private OficinaService oficinaService;

    @GetMapping("/all")
    @Cacheable("oficinas")
    @Operation(summary = "Listar Todos os Diagnósticos", description = "Retorna uma lista de todos os registros de diagnósticos da oficina.") // Descrição adicionada
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de registros retornada"),
            @ApiResponse(responseCode = "204", description = "Nenhum registro encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<List<OficinaResponseDto>> findAll() {
        log.info("Requisição para listar todos os registros de oficina");
        List<OficinaResponseDto> oficinas = oficinaService.findAll();
        if (oficinas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(oficinas);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Diagnóstico por ID", description = "Retorna um registro de diagnóstico específico pelo seu ID.") // Descrição adicionada
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registro encontrado"),
            @ApiResponse(responseCode = "404", description = "Registro não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<OficinaResponseDto> findById(
            @Parameter(description = "ID do registro de oficina a ser buscado") @PathVariable Long id // <<< @Parameter
    ) {
        log.info("Requisição para buscar registro de oficina por ID: {}", id);
        try {
            OficinaResponseDto oficina = oficinaService.findById(id);
            return ResponseEntity.ok(oficina);
        } catch (OficinaNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar registro de oficina ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @CacheEvict(value = "oficinas", allEntries = true)
    @Operation(summary = "Criar Novo Diagnóstico", description = "Cria um novo registro de diagnóstico na oficina.") // Descrição adicionada
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Registro criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar criar o registro")
    })
    public ResponseEntity<OficinaResponseDto> create(
            @Parameter(description = "Dados do diagnóstico para criação") @RequestBody @Valid OficinaRequestDto oficinaDto // <<< @Parameter
    ) {
        log.info("Requisição para criar novo registro de oficina: {}", oficinaDto.getDataOficina());
        try {
            OficinaResponseDto savedOficina = oficinaService.create(oficinaDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedOficina);
        } catch (Exception e) {
            log.error("Erro ao criar registro de oficina: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @CacheEvict(value = "oficinas", allEntries = true)
    @Operation(summary = "Atualizar Diagnóstico", description = "Atualiza um registro de diagnóstico existente.") // Descrição adicionada
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registro atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "404", description = "Registro não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar atualizar")
    })
    public ResponseEntity<OficinaResponseDto> update(
            @Parameter(description = "ID do registro a ser atualizado") @PathVariable Long id, // <<< @Parameter
            @Parameter(description = "Dados atualizados do diagnóstico") @RequestBody @Valid OficinaRequestDto oficinaDto // <<< @Parameter
    ) {
        log.info("Requisição para atualizar registro de oficina ID: {}", id);
        try {
            OficinaResponseDto updatedOficina = oficinaService.update(id, oficinaDto);
            return ResponseEntity.ok(updatedOficina);
        } catch (OficinaNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar registro de oficina ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = "oficinas", allEntries = true)
    @Operation(summary = "Deletar Diagnóstico", description = "Remove um registro de diagnóstico.") // Descrição adicionada
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Registro deletado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Registro não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar deletar")
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do registro a ser deletado") @PathVariable Long id // <<< @Parameter
    ) {
        log.info("Requisição para deletar registro de oficina ID: {}", id);
        try {
            oficinaService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (OficinaNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao deletar registro de oficina ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}