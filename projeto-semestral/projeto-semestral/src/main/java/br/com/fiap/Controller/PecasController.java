// --- src/main/java/br/com/fiap/Controller/PecasController.java ---
package br.com.fiap.Controller;

import br.com.fiap.dto.pecas.PecasRequestDto;
import br.com.fiap.dto.pecas.PecasResponseDto;
import br.com.fiap.exception.PecasNotFoundException;
import br.com.fiap.service.pecas.PecasService;
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
@RequestMapping("/rest/pecas")
@CrossOrigin(origins = "http://localhost:3000")
public class PecasController {

    private static final Logger log = LoggerFactory.getLogger(PecasController.class);

    @Autowired
    private PecasService pecasService;

    @GetMapping("/all")
    @Cacheable("pecas")
    @Operation(summary = "Listar todas as peças")
    public ResponseEntity<List<PecasResponseDto>> findAll() {
        log.info("Requisição para listar todas as peças");
        List<PecasResponseDto> pecas = pecasService.findAll();
        if (pecas.isEmpty()) {
            log.info("Nenhuma peça encontrada.");
            return ResponseEntity.noContent().build();
        }
        log.info("Retornando {} peças.", pecas.size());
        return ResponseEntity.ok(pecas);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar peça por ID")
    @ApiResponses(value = {@ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<PecasResponseDto> findById(@PathVariable Long id) {
        log.info("Requisição para buscar peça por ID: {}", id);
        try {
            PecasResponseDto peca = pecasService.findById(id);
            log.info("Peça encontrada: {}", id);
            return ResponseEntity.ok(peca);
        } catch (PecasNotFoundException e) {
            log.warn("Peça não encontrada para o ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar peça ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @CacheEvict(value = "pecas", allEntries = true)
    @Operation(summary = "Criar nova peça")
    @ApiResponses(value = {@ApiResponse(responseCode = "201"), @ApiResponse(responseCode = "400")})
    public ResponseEntity<PecasResponseDto> create(@RequestBody @Valid PecasRequestDto pecasDto) {
        log.info("Requisição para criar nova peça: {}", pecasDto.getDescricao());
        try {
            // Lógica de cálculo pode estar no service
            PecasResponseDto savedPeca = pecasService.create(pecasDto);
            log.info("Peça criada com ID: {}", savedPeca.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPeca);
        } catch (Exception e) {
            log.error("Erro ao criar peça: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @CacheEvict(value = "pecas", allEntries = true)
    @Operation(summary = "Atualizar peça")
    @ApiResponses(value = {@ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "404"), @ApiResponse(responseCode = "400")})
    public ResponseEntity<PecasResponseDto> update(@PathVariable Long id, @RequestBody @Valid PecasRequestDto pecasDto) {
        log.info("Requisição para atualizar peça ID: {}", id);
        try {
            PecasResponseDto updatedPeca = pecasService.update(id, pecasDto);
            log.info("Peça ID {} atualizada.", id);
            return ResponseEntity.ok(updatedPeca);
        } catch (PecasNotFoundException e) {
            log.warn("Peça não encontrada para atualização, ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar peça ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = "pecas", allEntries = true)
    @Operation(summary = "Deletar peça")
    @ApiResponses(value = {@ApiResponse(responseCode = "204"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Requisição para deletar peça ID: {}", id);
        try {
            pecasService.deleteById(id);
            log.info("Peça ID {} deletada.", id);
            return ResponseEntity.noContent().build();
        } catch (PecasNotFoundException e) {
            log.warn("Peça não encontrada para exclusão, ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao deletar peça ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    // Endpoints para gerenciar relacionamentos (Peca <-> Veiculo, Peca <-> Oficina, etc.)
}