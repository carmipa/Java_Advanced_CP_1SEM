// Pacote: br.com.fiap.controller

package br.com.fiap.controller;

// Imports necessários
import br.com.fiap.dto.oficina.ServicoHistoricoResponseDto; // DTO para o histórico
import br.com.fiap.dto.veiculo.VeiculoRequestDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.exception.VeiculoNotFoundException;
import br.com.fiap.service.oficina.OficinaService; // <<< SERVIÇO DA OFICINA
import br.com.fiap.service.veiculo.VeiculoService; // <<< SERVIÇO DO VEÍCULO
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/rest/veiculo") // Mantendo o path base original
// @CrossOrigin(origins = "http://localhost:3000") // REMOVIDO: A configuração global de CORS em SecurityConfig será usada
@Tag(name = "Veículos", description = "Operações relacionadas a veículos e seu histórico de serviços") // Tag atualizada
public class VeiculoController {

    private static final Logger log = LoggerFactory.getLogger(VeiculoController.class);

    // Injeção do VeiculoService (já existente)
    @Autowired
    private VeiculoService veiculoService;

    // <<< ADICIONADO: Injeção do OficinaService >>>
    @Autowired
    private OficinaService oficinaService;
    // <<< FIM DA ADIÇÃO >>>

    // --- Endpoints CRUD de Veículo (Existente) ---

    @GetMapping("/all")
    @Cacheable("veiculos")
    @Operation(summary = "Listar ou Buscar Veículos", description = "Retorna veículos, podendo filtrar por placa, modelo ou proprietário.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de veículos retornada"),
            @ApiResponse(responseCode = "204", description = "Nenhum veículo encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<List<VeiculoResponseDto>> findVeiculos(
            @Parameter(description = "Filtrar por parte da placa") @RequestParam(required = false) String placa,
            @Parameter(description = "Filtrar por parte do modelo") @RequestParam(required = false) String modelo,
            @Parameter(description = "Filtrar por parte do proprietário") @RequestParam(required = false) String proprietario) {
        log.info("Requisição para buscar/listar veículos com filtros: placa='{}', modelo='{}', proprietario='{}'", placa, modelo, proprietario);
        List<VeiculoResponseDto> veiculos;
        if ((placa != null && !placa.isBlank()) || (modelo != null && !modelo.isBlank()) || (proprietario != null && !proprietario.isBlank())) {
            veiculos = veiculoService.buscarVeiculos(placa, modelo, proprietario);
        } else {
            veiculos = veiculoService.findAll();
        }
        if (veiculos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(veiculos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Veículo por ID", description = "Retorna um veículo específico pelo seu ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Veículo encontrado"),
            @ApiResponse(responseCode = "404", description = "Veículo não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<VeiculoResponseDto> findById(
            @Parameter(description = "ID do veículo") @PathVariable Long id) {
        log.info("Requisição para buscar veículo por ID: {}", id);
        try {
            VeiculoResponseDto veiculo = veiculoService.findById(id);
            return ResponseEntity.ok(veiculo);
        } catch (VeiculoNotFoundException e) {
            // A exceção já tem @ResponseStatus(NOT_FOUND), mas relançar com ResponseStatusException dá mais controle se necessário
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar veículo ID {}: {}", id, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar veículo", e);
        }
    }

    @PostMapping
    @CacheEvict(value = "veiculos", allEntries = true)
    @Operation(summary = "Criar Novo Veículo", description = "Cria um novo registro de veículo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Veículo criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao criar veículo")
    })
    public ResponseEntity<VeiculoResponseDto> create(
            @Parameter(description = "Dados do veículo") @Valid @RequestBody VeiculoRequestDto veiculoDto) {
        log.info("Requisição para criar novo veículo: {}", veiculoDto.getPlaca());
        try {
            VeiculoResponseDto savedVeiculo = veiculoService.create(veiculoDto);
            // Considerar retornar a URI do recurso criado no header Location
            return ResponseEntity.status(HttpStatus.CREATED).body(savedVeiculo);
        } catch (Exception e) {
            log.error("Erro ao criar veículo: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao criar veículo", e);
        }
    }

    @PutMapping("/{id}")
    @CacheEvict(value = "veiculos", allEntries = true)
    @Operation(summary = "Atualizar Veículo", description = "Atualiza um veículo existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Veículo atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Veículo não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno")
    })
    public ResponseEntity<VeiculoResponseDto> update(
            @Parameter(description = "ID do veículo") @PathVariable Long id,
            @Parameter(description = "Dados atualizados") @Valid @RequestBody VeiculoRequestDto veiculoDto) {
        log.info("Requisição para atualizar veículo ID: {}", id);
        try {
            VeiculoResponseDto updatedVeiculo = veiculoService.update(id, veiculoDto);
            return ResponseEntity.ok(updatedVeiculo);
        } catch (VeiculoNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro ao atualizar veículo ID {}: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atualizar veículo", e);
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = "veiculos", allEntries = true)
    @Operation(summary = "Deletar Veículo", description = "Remove um veículo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Veículo deletado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Veículo não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno ou violação de integridade")
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do veículo") @PathVariable Long id) {
        log.info("Requisição para deletar veículo ID: {}", id);
        try {
            veiculoService.deleteById(id);
            return ResponseEntity.noContent().build(); // 204
        } catch (VeiculoNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
            // Capturar DataIntegrityViolationException se quiser retornar 409 Conflict
        } catch (Exception e) {
            log.error("Erro ao deletar veículo ID {}: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao deletar veículo", e);
        }
    }

    // --- NOVO ENDPOINT: Histórico de Serviços do Veículo ---
    @GetMapping("/{veiculoId}/servicos")
    @Operation(summary = "Listar Histórico de Serviços de um Veículo", description = "Retorna a lista de serviços/diagnósticos associados a um veículo específico.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de serviços retornada"),
            @ApiResponse(responseCode = "404", description = "Veículo não encontrado com o ID fornecido"),
            @ApiResponse(responseCode = "204", description = "Nenhum serviço encontrado para este veículo"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<List<ServicoHistoricoResponseDto>> getServicosByVeiculoId(
            @Parameter(description = "ID do veículo") @PathVariable Long veiculoId
    ) {
        log.info("Requisição GET /rest/veiculo/{}/servicos", veiculoId);
        try {
            // <<< USA O oficinaService INJETADO >>>
            List<ServicoHistoricoResponseDto> historico = oficinaService.findServicosByVeiculoId(veiculoId);
            if (historico.isEmpty()) {
                return ResponseEntity.noContent().build(); // 204
            }
            return ResponseEntity.ok(historico); // 200
        } catch (VeiculoNotFoundException e) {
            log.warn("Veículo não encontrado ao buscar histórico de serviços: ID {}", veiculoId);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro inesperado ao listar histórico do veículo {}: {}", veiculoId, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao listar histórico do veículo", e);
        }
    }
    // --- Fim do Novo Endpoint ---

} // <<< FIM DA CLASSE VeiculoController >>>