// --- src/main/java/br/com/fiap/Controller/OrcamentoController.java ---
package br.com.fiap.Controller;

import br.com.fiap.dto.orcamento.OrcamentoRequestDto;
import br.com.fiap.dto.orcamento.OrcamentoResponseDto;
import br.com.fiap.exception.OrcamentoNotFoundException;
import br.com.fiap.service.orcamento.OrcamentoService;
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
@RequestMapping("/rest/orcamento")
@CrossOrigin(origins = "http://localhost:3000")
public class OrcamentoController {

    private static final Logger log = LoggerFactory.getLogger(OrcamentoController.class);

    @Autowired
    private OrcamentoService orcamentoService;

    @GetMapping("/all")
    @Cacheable("orcamentos")
    @Operation(summary = "Listar todos os orçamentos")
    public ResponseEntity<List<OrcamentoResponseDto>> findAll() {
        log.info("Requisição para listar todos os orçamentos");
        List<OrcamentoResponseDto> orcamentos = orcamentoService.findAll();
        if (orcamentos.isEmpty()) {
            log.info("Nenhum orçamento encontrado.");
            return ResponseEntity.noContent().build();
        }
        log.info("Retornando {} orçamentos.", orcamentos.size());
        return ResponseEntity.ok(orcamentos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar orçamento por ID")
    @ApiResponses(value = {@ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<OrcamentoResponseDto> findById(@PathVariable Long id) {
        log.info("Requisição para buscar orçamento por ID: {}", id);
        try {
            OrcamentoResponseDto orcamento = orcamentoService.findById(id);
            log.info("Orçamento encontrado: {}", id);
            return ResponseEntity.ok(orcamento);
        } catch (OrcamentoNotFoundException e) {
            log.warn("Orçamento não encontrado para o ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar orçamento ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @CacheEvict(value = "orcamentos", allEntries = true)
    @Operation(summary = "Criar novo orçamento")
    @ApiResponses(value = {@ApiResponse(responseCode = "201"), @ApiResponse(responseCode = "400")})
    public ResponseEntity<OrcamentoResponseDto> create(@RequestBody @Valid OrcamentoRequestDto orcamentoDto) {
        log.info("Requisição para criar novo orçamento: {}", orcamentoDto.getDataOrcamento());
        try {
            // Lógica de cálculo pode estar no service
            OrcamentoResponseDto savedOrcamento = orcamentoService.create(orcamentoDto);
            log.info("Orçamento criado com ID: {}", savedOrcamento.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedOrcamento);
        } catch (Exception e) {
            log.error("Erro ao criar orçamento: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @CacheEvict(value = "orcamentos", allEntries = true)
    @Operation(summary = "Atualizar orçamento")
    @ApiResponses(value = {@ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "404"), @ApiResponse(responseCode = "400")})
    public ResponseEntity<OrcamentoResponseDto> update(@PathVariable Long id, @RequestBody @Valid OrcamentoRequestDto orcamentoDto) {
        log.info("Requisição para atualizar orçamento ID: {}", id);
        try {
            OrcamentoResponseDto updatedOrcamento = orcamentoService.update(id, orcamentoDto);
            log.info("Orçamento ID {} atualizado.", id);
            return ResponseEntity.ok(updatedOrcamento);
        } catch (OrcamentoNotFoundException e) {
            log.warn("Orçamento não encontrado para atualização, ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar orçamento ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = "orcamentos", allEntries = true)
    @Operation(summary = "Deletar orçamento")
    @ApiResponses(value = {@ApiResponse(responseCode = "204"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Requisição para deletar orçamento ID: {}", id);
        try {
            orcamentoService.deleteById(id);
            log.info("Orçamento ID {} deletado.", id);
            return ResponseEntity.noContent().build();
        } catch (OrcamentoNotFoundException e) {
            log.warn("Orçamento não encontrado para exclusão, ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao deletar orçamento ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    // Endpoints para gerenciar relacionamentos (Orcamento <-> Cliente, Orcamento <-> Pagamento, etc.)
}