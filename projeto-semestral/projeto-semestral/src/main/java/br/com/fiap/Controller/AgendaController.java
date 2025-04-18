
package br.com.fiap.Controller;

import br.com.fiap.dto.agenda.AgendaRequestDto;
import br.com.fiap.dto.agenda.AgendaResponseDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.exception.AgendaNotFoundException;
import br.com.fiap.service.agenda.AgendaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
@RequestMapping("/rest/agenda")
@CrossOrigin(origins = "http://localhost:3000")
public class AgendaController {

    private static final Logger log = LoggerFactory.getLogger(AgendaController.class);

    @Autowired
    private AgendaService agendaService;

    @GetMapping("/all")
    @Cacheable("agendas")
    @Operation(summary = "Listar todas as agendas")
    public ResponseEntity<List<AgendaResponseDto>> findAll() {
        log.info("Requisição para listar todas as agendas recebida");
        List<AgendaResponseDto> agendas = agendaService.findAll();
        if (agendas.isEmpty()) {
            log.info("Nenhuma agenda encontrada.");
            return ResponseEntity.noContent().build();
        }
        log.info("Retornando {} agendas.", agendas.size());
        return ResponseEntity.ok(agendas);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar agenda por ID")
    @ApiResponses(value = { @ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<AgendaResponseDto> findById(@PathVariable Long id) {
        log.info("Requisição para buscar agenda por ID: {}", id);
        try {
            AgendaResponseDto agenda = agendaService.findById(id);
            log.info("Agenda encontrada: {}", agenda.getId());
            return ResponseEntity.ok(agenda);
        } catch (AgendaNotFoundException e) { // Captura específica
            log.warn("Agenda não encontrada para o ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) { // Captura genérica para outros erros
            log.error("Erro inesperado ao buscar agenda por ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @CacheEvict(value = "agendas", allEntries = true)
    @Operation(summary = "Criar nova agenda")
    @ApiResponses(value = { @ApiResponse(responseCode = "201"), @ApiResponse(responseCode = "400")})
    public ResponseEntity<?> create(@RequestBody @Valid AgendaRequestDto agendaDto) { // Usar wildcard <?> ou um DTO de erro
        log.info("Requisição para criar nova agenda recebida: {}", agendaDto.getDataAgendamento());
        try {
            AgendaResponseDto savedAgenda = agendaService.create(agendaDto);
            log.info("Agenda criada com sucesso com ID: {}", savedAgenda.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedAgenda);
        } catch (Exception e) {
            log.error("Erro ao criar agenda: {}", e.getMessage(), e);
            // Pode retornar uma mensagem de erro mais específica no corpo se desejar
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno ao criar agenda.");
        }
    }

    @PutMapping("/{id}")
    @CacheEvict(value = "agendas", allEntries = true)
    @Operation(summary = "Atualizar agenda")
    @ApiResponses(value = { @ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "404"), @ApiResponse(responseCode = "400")})
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody @Valid AgendaRequestDto agendaDto) { // Usar wildcard <?> ou um DTO de erro
        log.info("Requisição para atualizar agenda ID: {}", id);
        try {
            AgendaResponseDto updatedAgenda = agendaService.update(id, agendaDto);
            log.info("Agenda ID {} atualizada com sucesso.", id);
            return ResponseEntity.ok(updatedAgenda);
        } catch (AgendaNotFoundException e) { // Captura específica
            log.warn("Agenda não encontrada para atualização, ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) { // Captura genérica
            log.error("Erro ao atualizar agenda ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno ao atualizar agenda.");
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = "agendas", allEntries = true)
    @Operation(summary = "Deletar agenda")
    @ApiResponses(value = { @ApiResponse(responseCode = "204"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Requisição para deletar agenda ID: {}", id);
        try {
            agendaService.deleteById(id);
            log.info("Agenda ID {} deletada com sucesso.", id);
            return ResponseEntity.noContent().build();
        } catch (AgendaNotFoundException e) { // Captura específica
            log.warn("Agenda não encontrada para exclusão, ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) { // Captura genérica (poderia ser mais específica para DataIntegrityViolationException -> CONFLICT)
            log.error("Erro ao deletar agenda ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- Endpoints de Relacionamento (Exemplo Agenda <-> Veiculo) ---

    @PostMapping("/{agendaId}/veiculos/{veiculoId}")
    @Operation(summary = "Associar Veículo")
    @ApiResponses(value = { @ApiResponse(responseCode = "204"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<Void> associarVeiculo(@PathVariable Long agendaId, @PathVariable Long veiculoId) {
        log.info("Requisição para associar veículo ID {} à agenda ID {}", veiculoId, agendaId);
        try {
            agendaService.associarVeiculo(agendaId, veiculoId);
            log.info("Veículo {} associado à agenda {} com sucesso", veiculoId, agendaId);
            return ResponseEntity.noContent().build();
            // } catch (AgendaNotFoundException | VeiculoNotFoundException e) { // << CORREÇÃO APLICADA AQUI TAMBÉM
        } catch (AgendaNotFoundException e) { // Captura AgendaNotFound
            log.warn("Erro ao associar veículo {} à agenda {}: {}", veiculoId, agendaId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // Retorna 404
            // } catch (VeiculoNotFoundException e) { // Captura VeiculoNotFound (se existir e for lançada pelo service)
            //     log.warn("Erro ao associar veículo {} à agenda {}: {}", veiculoId, agendaId, e.getMessage());
            //     return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // Retorna 404
        } catch (UnsupportedOperationException e) { // Captura a exceção de método não implementado
            log.error("Funcionalidade 'associarVeiculo' não implementada no serviço.");
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build(); // 501 Not Implemented
        } catch (Exception e) { // Captura outros erros
            log.error("Erro inesperado ao associar veículo {} à agenda {}: {}", veiculoId, agendaId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{agendaId}/veiculos/{veiculoId}")
    @Operation(summary = "Desassociar Veículo")
    @ApiResponses(value = { @ApiResponse(responseCode = "204"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<Void> desassociarVeiculo(@PathVariable Long agendaId, @PathVariable Long veiculoId) {
        log.info("Requisição para desassociar veículo ID {} da agenda ID {}", veiculoId, agendaId);
        try {
            agendaService.desassociarVeiculo(agendaId, veiculoId);
            log.info("Veículo {} desassociado da agenda {} com sucesso", veiculoId, agendaId);
            return ResponseEntity.noContent().build();
            // } catch (AssociacaoNaoEncontradaException e) { // Exemplo de exceção específica para associação
            //     log.warn("Erro ao desassociar veículo {} da agenda {}: {}", veiculoId, agendaId, e.getMessage());
            //     return ResponseEntity.notFound().build();
        } catch (UnsupportedOperationException e) { // Captura a exceção de método não implementado
            log.error("Funcionalidade 'desassociarVeiculo' não implementada no serviço.");
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build(); // 501 Not Implemented
        } catch (Exception e) { // Captura outros erros
            log.error("Erro inesperado ao desassociar veículo {} da agenda {}: {}", veiculoId, agendaId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{agendaId}/veiculos")
    @Operation(summary = "Listar Veículos da Agenda")
    @ApiResponses(value = { @ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<?> findVeiculosByAgendaId(@PathVariable Long agendaId) { // Retorna wildcard ou DTO de erro
        log.info("Requisição para listar veículos da agenda ID {}", agendaId);
        try {
            List<VeiculoResponseDto> veiculos = agendaService.findVeiculosByAgendaId(agendaId);
            log.info("Retornando {} veículos para a agenda {}", veiculos.size(), agendaId);
            return ResponseEntity.ok(veiculos);
        } catch (AgendaNotFoundException e) { // Captura específica
            log.warn("Agenda não encontrada para listar veículos, ID: {}", agendaId);
            return ResponseEntity.notFound().build();
        } catch (UnsupportedOperationException e) { // Captura a exceção de método não implementado
            log.error("Funcionalidade 'findVeiculosByAgendaId' não implementada no serviço.");
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build(); // 501 Not Implemented
        } catch (Exception e) { // Captura genérica
            log.error("Erro inesperado ao listar veículos da agenda {}: {}", agendaId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno ao listar veículos.");
        }
    }
}