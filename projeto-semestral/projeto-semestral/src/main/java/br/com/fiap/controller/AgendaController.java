// src/main/java/br/com/fiap/Controller/AgendaController.java
package br.com.fiap.controller;

import br.com.fiap.dto.agenda.AgendaRequestDto;
import br.com.fiap.dto.agenda.AgendaResponseDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.exception.AgendaNotFoundException;
import br.com.fiap.exception.AssociacaoNotFoundException;
import br.com.fiap.exception.VeiculoNotFoundException;
import br.com.fiap.service.agenda.AgendaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag; // <<< Importar Tag
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/rest/agenda")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Agendamentos", description = "Operações relacionadas a agendamentos de serviços") // <<< TAG ATUALIZADA
public class AgendaController {

    private static final Logger log = LoggerFactory.getLogger(AgendaController.class);

    @Autowired
    private AgendaService agendaService;

    @GetMapping
    @Operation(summary = "Listar Agendamentos",
            description = "Retorna uma lista paginada de agendamentos, com opções de filtro por data e observação. Parâmetros de paginação: ?page=0&size=10&sort=dataAgendamento,desc")
    @ApiResponses(value = { // <<< ApiResponses Adicionadas/Revisadas
            @ApiResponse(responseCode = "200", description = "Lista de agendamentos retornada"),
            @ApiResponse(responseCode = "204", description = "Nenhum agendamento encontrado para os filtros"),
            @ApiResponse(responseCode = "400", description = "Parâmetros de filtro ou paginação inválidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<Page<AgendaResponseDto>> findWithFilters(
            @Parameter(description = "Filtrar por data inicial (formato YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(description = "Filtrar por data final (formato YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @Parameter(description = "Filtrar por parte da observação (case-insensitive)") @RequestParam(required = false) String observacao,
            @Parameter(hidden = true) Pageable pageable
    ) {
        log.info("Requisição GET /rest/agenda com filtros e paginação recebida.");
        Page<AgendaResponseDto> paginaAgendas = agendaService.findWithFilters(dataInicio, dataFim, observacao, pageable);
        if (paginaAgendas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(paginaAgendas);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Agendamento por ID", description = "Retorna um agendamento específico pelo seu ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Agendamento encontrado"),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado para o ID fornecido"), // Descrição adicionada
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<AgendaResponseDto> findById(
            @Parameter(description = "ID do agendamento a ser buscado") @PathVariable Long id // <<< @Parameter adicionado
    ) {
        try {
            AgendaResponseDto agenda = agendaService.findById(id);
            return ResponseEntity.ok(agenda);
        } catch (AgendaNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @CacheEvict(value = {"agendas", "veiculosDaAgenda"}, allEntries = true)
    @Operation(summary = "Criar Novo Agendamento", description = "Registra um novo agendamento no sistema.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Agendamento criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos para o agendamento"), // Descrição adicionada
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar criar o agendamento")
    })
    public ResponseEntity<?> create(
            @Parameter(description = "Dados do agendamento para criação") // <<< @Parameter adicionado
            @RequestBody @Valid AgendaRequestDto agendaDto
    ) {
        try {
            AgendaResponseDto savedAgenda = agendaService.create(agendaDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedAgenda);
        } catch (Exception e) {
            // Simplificado para retornar apenas o status 500, o log de erro está no service
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @CacheEvict(value = {"agendas", "veiculosDaAgenda"}, allEntries = true)
    @Operation(summary = "Atualizar Agendamento", description = "Atualiza os dados de um agendamento existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Agendamento atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos para atualização"),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar atualizar o agendamento")
    })
    public ResponseEntity<?> update(
            @Parameter(description = "ID do agendamento a ser atualizado") @PathVariable Long id, // <<< @Parameter adicionado
            @Parameter(description = "Dados atualizados do agendamento") @RequestBody @Valid AgendaRequestDto agendaDto // <<< @Parameter adicionado
    ) {
        try {
            AgendaResponseDto updatedAgenda = agendaService.update(id, agendaDto);
            return ResponseEntity.ok(updatedAgenda);
        } catch (AgendaNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = {"agendas", "veiculosDaAgenda"}, allEntries = true)
    @Operation(summary = "Deletar Agendamento", description = "Remove um agendamento do sistema.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Agendamento deletado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado para o ID fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar deletar o agendamento") // Ou 409 se houver conflito de integridade
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do agendamento a ser deletado") @PathVariable Long id // <<< @Parameter adicionado
    ) {
        try {
            agendaService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (AgendaNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // Poderia verificar DataIntegrityViolationException e retornar 409 Conflict
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- Endpoints de Relacionamento ---
    @PostMapping("/{agendaId}/veiculos/{veiculoId}")
    @CacheEvict(value = "veiculosDaAgenda", key = "#agendaId")
    @Operation(summary = "Associar Veículo a uma Agenda", description = "Cria uma associação entre um agendamento e um veículo existentes.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Associação criada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Agenda ou Veículo não encontrado com os IDs fornecidos")
            // Poderia adicionar 409 se a associação já existir
    })
    public ResponseEntity<Void> associarVeiculo(
            @Parameter(description = "ID da agenda") @PathVariable Long agendaId,
            @Parameter(description = "ID do veículo a ser associado") @PathVariable Long veiculoId
    ) {
        log.info("Requisição para associar veículo ID {} à agenda ID {}", veiculoId, agendaId);
        try {
            agendaService.associarVeiculo(agendaId, veiculoId);
            return ResponseEntity.noContent().build();
        } catch (AgendaNotFoundException | VeiculoNotFoundException e) {
            log.warn("Erro ao associar veículo {} à agenda {}: {}", veiculoId, agendaId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao associar veículo {} à agenda {}: {}", veiculoId, agendaId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{agendaId}/veiculos/{veiculoId}")
    @CacheEvict(value = "veiculosDaAgenda", key = "#agendaId")
    @Operation(summary = "Desassociar Veículo de uma Agenda", description = "Remove a associação entre um agendamento e um veículo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Associação removida com sucesso"),
            @ApiResponse(responseCode = "404", description = "Associação não encontrada entre a Agenda e o Veículo fornecidos")
    })
    public ResponseEntity<Void> desassociarVeiculo(
            @Parameter(description = "ID da agenda") @PathVariable Long agendaId,
            @Parameter(description = "ID do veículo a ser desassociado") @PathVariable Long veiculoId
    ) {
        log.info("Requisição para desassociar veículo ID {} da agenda ID {}", veiculoId, agendaId);
        try {
            agendaService.desassociarVeiculo(agendaId, veiculoId);
            return ResponseEntity.noContent().build();
        } catch (AssociacaoNotFoundException e) {
            log.warn("Erro ao desassociar veículo {} da agenda {}: {}", veiculoId, agendaId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao desassociar veículo {} da agenda {}: {}", veiculoId, agendaId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{agendaId}/veiculos")
    @Operation(summary = "Listar Veículos de uma Agenda", description = "Retorna a lista de veículos associados a um agendamento específico.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de veículos retornada (pode ser vazia)"),
            @ApiResponse(responseCode = "404", description = "Agenda não encontrada com o ID fornecido")
    })
    public ResponseEntity<List<VeiculoResponseDto>> findVeiculosByAgendaId(
            @Parameter(description = "ID da agenda para a qual listar os veículos") @PathVariable Long agendaId
    ) {
        log.info("Requisição para listar veículos da agenda ID {}", agendaId);
        try {
            List<VeiculoResponseDto> veiculos = agendaService.findVeiculosByAgendaId(agendaId);
            return ResponseEntity.ok(veiculos); // Retorna 200 OK mesmo se a lista for vazia
        } catch (AgendaNotFoundException e) {
            log.warn("Agenda não encontrada para listar veículos, ID: {}", agendaId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao listar veículos da agenda {}: {}", agendaId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}