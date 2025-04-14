// --- src/main/java/br/com/fiap/Controller/OficinaController.java ---
package br.com.fiap.Controller;

import br.com.fiap.dto.oficina.OficinaRequestDto;
import br.com.fiap.dto.oficina.OficinaResponseDto;
import br.com.fiap.exception.OficinaNotFoundException;
import br.com.fiap.service.oficina.OficinaService;
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
@RequestMapping("/rest/oficina")
@CrossOrigin(origins = "http://localhost:3000")
public class OficinaController {

    private static final Logger log = LoggerFactory.getLogger(OficinaController.class);

    @Autowired
    private OficinaService oficinaService;

    @GetMapping("/all")
    @Cacheable("oficinas")
    @Operation(summary = "Listar todos os registros de oficina")
    public ResponseEntity<List<OficinaResponseDto>> findAll() {
        log.info("Requisição para listar todos os registros de oficina");
        List<OficinaResponseDto> oficinas = oficinaService.findAll();
        if (oficinas.isEmpty()) {
            log.info("Nenhum registro de oficina encontrado.");
            return ResponseEntity.noContent().build();
        }
        log.info("Retornando {} registros de oficina.", oficinas.size());
        return ResponseEntity.ok(oficinas);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar registro de oficina por ID")
    @ApiResponses(value = {@ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<OficinaResponseDto> findById(@PathVariable Long id) {
        log.info("Requisição para buscar registro de oficina por ID: {}", id);
        try {
            OficinaResponseDto oficina = oficinaService.findById(id);
            log.info("Registro de oficina encontrado: {}", id);
            return ResponseEntity.ok(oficina);
        } catch (OficinaNotFoundException e) {
            log.warn("Registro de oficina não encontrado para o ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar registro de oficina ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @CacheEvict(value = "oficinas", allEntries = true)
    @Operation(summary = "Criar novo registro de oficina")
    @ApiResponses(value = {@ApiResponse(responseCode = "201"), @ApiResponse(responseCode = "400")})
    public ResponseEntity<OficinaResponseDto> create(@RequestBody @Valid OficinaRequestDto oficinaDto) {
        log.info("Requisição para criar novo registro de oficina: {}", oficinaDto.getDataOficina());
        try {
            OficinaResponseDto savedOficina = oficinaService.create(oficinaDto);
            log.info("Registro de oficina criado com ID: {}", savedOficina.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedOficina);
        } catch (Exception e) {
            log.error("Erro ao criar registro de oficina: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @CacheEvict(value = "oficinas", allEntries = true)
    @Operation(summary = "Atualizar registro de oficina")
    @ApiResponses(value = {@ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "404"), @ApiResponse(responseCode = "400")})
    public ResponseEntity<OficinaResponseDto> update(@PathVariable Long id, @RequestBody @Valid OficinaRequestDto oficinaDto) {
        log.info("Requisição para atualizar registro de oficina ID: {}", id);
        try {
            OficinaResponseDto updatedOficina = oficinaService.update(id, oficinaDto);
            log.info("Registro de oficina ID {} atualizado.", id);
            return ResponseEntity.ok(updatedOficina);
        } catch (OficinaNotFoundException e) {
            log.warn("Registro de oficina não encontrado para atualização, ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar registro de oficina ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = "oficinas", allEntries = true)
    @Operation(summary = "Deletar registro de oficina")
    @ApiResponses(value = {@ApiResponse(responseCode = "204"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Requisição para deletar registro de oficina ID: {}", id);
        try {
            oficinaService.deleteById(id);
            log.info("Registro de oficina ID {} deletado.", id);
            return ResponseEntity.noContent().build();
        } catch (OficinaNotFoundException e) {
            log.warn("Registro de oficina não encontrado para exclusão, ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao deletar registro de oficina ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoints para gerenciar relacionamentos (Oficina <-> Peca, Oficina <-> Veiculo, etc.)
}