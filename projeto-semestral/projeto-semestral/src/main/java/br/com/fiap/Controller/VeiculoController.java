// --- src/main/java/br/com/fiap/Controller/VeiculoController.java ---
package br.com.fiap.Controller;

import br.com.fiap.dto.veiculo.VeiculoRequestDto;
import br.com.fiap.dto.veiculo.VeiculoResponseDto;
import br.com.fiap.exception.VeiculoNotFoundException;
import br.com.fiap.service.veiculo.VeiculoService;
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
@RequestMapping("/rest/veiculo")
@CrossOrigin(origins = "http://localhost:3000")
public class VeiculoController {

    private static final Logger log = LoggerFactory.getLogger(VeiculoController.class);

    @Autowired
    private VeiculoService veiculoService;

    @GetMapping("/all")
    @Cacheable("veiculos")
    @Operation(summary = "Listar todos os veículos")
    public ResponseEntity<List<VeiculoResponseDto>> findAll() {
        log.info("Requisição para listar todos os veículos");
        List<VeiculoResponseDto> veiculos = veiculoService.findAll();
        if (veiculos.isEmpty()) {
            log.info("Nenhum veículo encontrado.");
            return ResponseEntity.noContent().build();
        }
        log.info("Retornando {} veículos.", veiculos.size());
        return ResponseEntity.ok(veiculos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar veículo por ID")
    @ApiResponses(value = {@ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<VeiculoResponseDto> findById(@PathVariable Long id) {
        log.info("Requisição para buscar veículo por ID: {}", id);
        try {
            VeiculoResponseDto veiculo = veiculoService.findById(id);
            log.info("Veículo encontrado: {}", id);
            return ResponseEntity.ok(veiculo);
        } catch (VeiculoNotFoundException e) {
            log.warn("Veículo não encontrado para o ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar veículo ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @CacheEvict(value = "veiculos", allEntries = true)
    @Operation(summary = "Criar novo veículo")
    @ApiResponses(value = {@ApiResponse(responseCode = "201"), @ApiResponse(responseCode = "400")})
    public ResponseEntity<VeiculoResponseDto> create(@RequestBody @Valid VeiculoRequestDto veiculoDto) {
        log.info("Requisição para criar novo veículo: {}", veiculoDto.getPlaca());
        try {
            VeiculoResponseDto savedVeiculo = veiculoService.create(veiculoDto);
            log.info("Veículo criado com ID: {}", savedVeiculo.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedVeiculo);
        } catch (Exception e) {
            log.error("Erro ao criar veículo: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @CacheEvict(value = "veiculos", allEntries = true)
    @Operation(summary = "Atualizar veículo")
    @ApiResponses(value = {@ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "404"), @ApiResponse(responseCode = "400")})
    public ResponseEntity<VeiculoResponseDto> update(@PathVariable Long id, @RequestBody @Valid VeiculoRequestDto veiculoDto) {
        log.info("Requisição para atualizar veículo ID: {}", id);
        try {
            VeiculoResponseDto updatedVeiculo = veiculoService.update(id, veiculoDto);
            log.info("Veículo ID {} atualizado.", id);
            return ResponseEntity.ok(updatedVeiculo);
        } catch (VeiculoNotFoundException e) {
            log.warn("Veículo não encontrado para atualização, ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar veículo ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = "veiculos", allEntries = true)
    @Operation(summary = "Deletar veículo")
    @ApiResponses(value = {@ApiResponse(responseCode = "204"), @ApiResponse(responseCode = "404")})
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Requisição para deletar veículo ID: {}", id);
        try {
            veiculoService.deleteById(id);
            log.info("Veículo ID {} deletado.", id);
            return ResponseEntity.noContent().build();
        } catch (VeiculoNotFoundException e) {
            log.warn("Veículo não encontrado para exclusão, ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao deletar veículo ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    // Endpoints para gerenciar relacionamentos (Veiculo <-> Agenda, Veiculo <-> Cliente, etc.)
}