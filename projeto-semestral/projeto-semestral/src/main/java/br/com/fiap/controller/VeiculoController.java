// src/main/java/br/com/fiap/Controller/VeiculoController.java
package br.com.fiap.controller;

import br.com.fiap.dto.veiculo.VeiculoRequestDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.exception.VeiculoNotFoundException;
import br.com.fiap.service.veiculo.VeiculoService;
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
import org.springframework.web.bind.annotation.RequestParam; // <<< Importar para busca

import java.util.List;

@RestController
@RequestMapping("/rest/veiculo")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Veículos", description = "Operações relacionadas a veículos") // <<< TAG ATUALIZADA
public class VeiculoController {

    private static final Logger log = LoggerFactory.getLogger(VeiculoController.class);
    @Autowired
    private VeiculoService veiculoService;

    // Endpoint de Busca/Listagem com Filtro
    @GetMapping("/all") // Mantido como /all, mas agora aceita filtros
    @Cacheable("veiculos") // Cache pode ser menos eficaz com filtros dinâmicos
    @Operation(summary = "Listar ou Buscar Veículos",
            description = "Retorna uma lista de veículos. Pode ser filtrada por placa, modelo ou proprietário (parâmetros de query opcionais).") // Descrição unificada
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de veículos retornada (pode ser vazia se filtro não encontrar nada)"),
            @ApiResponse(responseCode = "204", description = "Nenhum veículo cadastrado no sistema (sem filtros)"), // Aplica-se mais sem filtros
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<List<VeiculoResponseDto>> findVeiculos( // Nome do método mais genérico
                                                                  @Parameter(description = "Filtrar por parte da placa (case-insensitive)") @RequestParam(required = false) String placa,
                                                                  @Parameter(description = "Filtrar por parte do modelo (case-insensitive)") @RequestParam(required = false) String modelo,
                                                                  @Parameter(description = "Filtrar por parte do nome do proprietário (case-insensitive)") @RequestParam(required = false) String proprietario
    ) {
        log.info("Requisição para buscar/listar veículos com filtros: placa='{}', modelo='{}', proprietario='{}'", placa, modelo, proprietario);
        List<VeiculoResponseDto> veiculos;
        // Chama o método de busca do service se houver filtros
        if ((placa != null && !placa.isBlank()) || (modelo != null && !modelo.isBlank()) || (proprietario != null && !proprietario.isBlank())) {
            veiculos = veiculoService.buscarVeiculos(placa, modelo, proprietario);
        } else {
            // Chama o findAll normal se não houver filtros
            veiculos = veiculoService.findAll();
        }

        if (veiculos.isEmpty()) {
            // Retorna 204 se a busca com filtros não retornou nada, ou se não há veículos cadastrados
            log.info("Nenhum veículo encontrado para os critérios ou nenhum veículo cadastrado.");
            return ResponseEntity.noContent().build();
        }
        log.info("Retornando {} veículos.", veiculos.size());
        return ResponseEntity.ok(veiculos);
    }


    @GetMapping("/{id}")
    @Operation(summary = "Buscar Veículo por ID", description = "Retorna um veículo específico pelo seu ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Veículo encontrado"),
            @ApiResponse(responseCode = "404", description = "Veículo não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<VeiculoResponseDto> findById(
            @Parameter(description = "ID do veículo a ser buscado") @PathVariable Long id
    ) {
        log.info("Requisição para buscar veículo por ID: {}", id);
        try {
            VeiculoResponseDto veiculo = veiculoService.findById(id);
            return ResponseEntity.ok(veiculo);
        } catch (VeiculoNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar veículo ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @CacheEvict(value = "veiculos", allEntries = true)
    @Operation(summary = "Criar Novo Veículo", description = "Cria um novo registro de veículo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Veículo criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar criar o veículo")
    })
    public ResponseEntity<VeiculoResponseDto> create(
            @Parameter(description = "Dados do veículo para criação") @RequestBody @Valid VeiculoRequestDto veiculoDto
    ) {
        log.info("Requisição para criar novo veículo: {}", veiculoDto.getPlaca());
        try {
            VeiculoResponseDto savedVeiculo = veiculoService.create(veiculoDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedVeiculo);
        } catch (Exception e) {
            log.error("Erro ao criar veículo: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @CacheEvict(value = "veiculos", allEntries = true)
    @Operation(summary = "Atualizar Veículo", description = "Atualiza um veículo existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Veículo atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "404", description = "Veículo não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar atualizar")
    })
    public ResponseEntity<VeiculoResponseDto> update(
            @Parameter(description = "ID do veículo a ser atualizado") @PathVariable Long id,
            @Parameter(description = "Dados atualizados do veículo") @RequestBody @Valid VeiculoRequestDto veiculoDto
    ) {
        log.info("Requisição para atualizar veículo ID: {}", id);
        try {
            VeiculoResponseDto updatedVeiculo = veiculoService.update(id, veiculoDto);
            return ResponseEntity.ok(updatedVeiculo);
        } catch (VeiculoNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar veículo ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = "veiculos", allEntries = true)
    @Operation(summary = "Deletar Veículo", description = "Remove um veículo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Veículo deletado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Veículo não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar deletar") // Ou 409
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do veículo a ser deletado") @PathVariable Long id
    ) {
        log.info("Requisição para deletar veículo ID: {}", id);
        try {
            veiculoService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (VeiculoNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) { // Captura DataIntegrityViolation etc.
            log.error("Erro ao deletar veículo ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}