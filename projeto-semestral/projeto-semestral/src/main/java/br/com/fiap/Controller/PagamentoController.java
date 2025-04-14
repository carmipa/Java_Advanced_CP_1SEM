// --- src/main/java/br/com/fiap/Controller/PagamentoController.java ---
package br.com.fiap.Controller;

import br.com.fiap.dto.pagamento.PagamentoRequestDto;
import br.com.fiap.dto.pagamento.PagamentoResponseDto;
import br.com.fiap.exception.PagamentoNotFoundException;
import br.com.fiap.service.pagamento.PagamentoService;
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
@RequestMapping("/rest/pagamento")
@CrossOrigin(origins = "http://localhost:3000")
public class PagamentoController {

    private static final Logger log = LoggerFactory.getLogger(PagamentoController.class);

    @Autowired
    private PagamentoService pagamentoService;

    @GetMapping("/all")
    @Cacheable("pagamentos")
    @Operation(summary = "Listar todos os pagamentos")
    public ResponseEntity<List<PagamentoResponseDto>> findAll() {
        log.info("Requisição para listar todos os pagamentos");
        List<PagamentoResponseDto> pagamentos = pagamentoService.findAll();
        if (pagamentos.isEmpty()) {
            log.info("Nenhum pagamento encontrado.");
            return ResponseEntity.noContent().build();
        }
        log.info("Retornando {} pagamentos.", pagamentos.size());
        return ResponseEntity.ok(pagamentos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar pagamento por ID")
    @ApiResponses(value = {@ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<PagamentoResponseDto> findById(@PathVariable Long id) {
        log.info("Requisição para buscar pagamento por ID: {}", id);
        try {
            PagamentoResponseDto pagamento = pagamentoService.findById(id);
            log.info("Pagamento encontrado: {}", id);
            return ResponseEntity.ok(pagamento);
        } catch (PagamentoNotFoundException e) {
            log.warn("Pagamento não encontrado para o ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar pagamento ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @CacheEvict(value = "pagamentos", allEntries = true)
    @Operation(summary = "Criar novo pagamento")
    @ApiResponses(value = {@ApiResponse(responseCode = "201"), @ApiResponse(responseCode = "400")})
    public ResponseEntity<PagamentoResponseDto> create(@RequestBody @Valid PagamentoRequestDto pagamentoDto) {
        log.info("Requisição para criar novo pagamento: {}", pagamentoDto.getTipoPagamento());
        try {
            // Lógica de cálculo pode estar no service
            PagamentoResponseDto savedPagamento = pagamentoService.create(pagamentoDto);
            log.info("Pagamento criado com ID: {}", savedPagamento.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPagamento);
        } catch (Exception e) {
            log.error("Erro ao criar pagamento: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @CacheEvict(value = "pagamentos", allEntries = true)
    @Operation(summary = "Atualizar pagamento")
    @ApiResponses(value = {@ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "404"), @ApiResponse(responseCode = "400")})
    public ResponseEntity<PagamentoResponseDto> update(@PathVariable Long id, @RequestBody @Valid PagamentoRequestDto pagamentoDto) {
        log.info("Requisição para atualizar pagamento ID: {}", id);
        try {
            PagamentoResponseDto updatedPagamento = pagamentoService.update(id, pagamentoDto);
            log.info("Pagamento ID {} atualizado.", id);
            return ResponseEntity.ok(updatedPagamento);
        } catch (PagamentoNotFoundException e) {
            log.warn("Pagamento não encontrado para atualização, ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar pagamento ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = "pagamentos", allEntries = true)
    @Operation(summary = "Deletar pagamento")
    @ApiResponses(value = {@ApiResponse(responseCode = "204"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Requisição para deletar pagamento ID: {}", id);
        try {
            pagamentoService.deleteById(id);
            log.info("Pagamento ID {} deletado.", id);
            return ResponseEntity.noContent().build();
        } catch (PagamentoNotFoundException e) {
            log.warn("Pagamento não encontrado para exclusão, ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao deletar pagamento ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    // Endpoints para gerenciar relacionamentos (Pagamento <-> Orcamento, etc.)
}