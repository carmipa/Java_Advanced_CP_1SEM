// br/com/fiap/controller/OrcamentoController.java
package br.com.fiap.controller;

import br.com.fiap.dto.orcamento.OrcamentoComServicoRequestDto;
import br.com.fiap.dto.orcamento.OrcamentoRequestDto; // Para o CRUD simples, se mantido
import br.com.fiap.dto.orcamento.OrcamentoResponseDto;
import br.com.fiap.exception.*; // Importa todas as suas custom exceptions
import br.com.fiap.service.orcamento.OrcamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException; // Import para ResponseStatusException
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/rest/orcamentos")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Orçamentos", description = "Operações relacionadas a orçamentos de serviços")
public class OrcamentoController {

    private static final Logger log = LoggerFactory.getLogger(OrcamentoController.class);

    @Autowired
    private OrcamentoService orcamentoService;

    @PostMapping("/completo")
    @Operation(summary = "Registrar Serviço com Orçamento e Peças",
            description = "Cria um novo serviço de oficina com suas peças e um orçamento associado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Serviço e Orçamento registrados com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = OrcamentoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "404", description = "Entidade relacionada não encontrada (ex: Peça, Cliente, Veículo)"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<OrcamentoResponseDto> registrarServicoComOrcamento(
            @Parameter(description = "Dados completos do serviço da oficina e do orçamento", required = true)
            @Valid @RequestBody OrcamentoComServicoRequestDto dto) {
        log.info("Requisição POST /rest/orcamentos/completo recebida");
        try {
            OrcamentoResponseDto orcamentoSalvo = orcamentoService.registrarServicoComOrcamento(dto);
            URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/rest/orcamentos/{id}")
                    .buildAndExpand(orcamentoSalvo.getId()).toUri();
            log.info("Serviço e Orçamento registrados com sucesso. Orçamento ID: {}", orcamentoSalvo.getId());
            return ResponseEntity.created(location).body(orcamentoSalvo);
        } catch (PecasNotFoundException | OficinaNotFoundException | ClientesNotFoundException | VeiculoNotFoundException e) {
            log.warn("Erro de entidade não encontrada ao registrar serviço com orçamento: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("Argumento inválido ao registrar serviço com orçamento: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            log.error("Erro interno ao registrar serviço com orçamento: {}", e.getMessage(), e);
            // CORREÇÃO: Adicionar o throw ou return aqui
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno ao processar a solicitação.", e);
        }
    } // Fechamento do método registrarServicoComOrcamento

    // Se você decidir manter o CRUD simples de Orcamento (sem peças/serviço detalhado)
    @PostMapping("/simples")
    @Operation(summary = "Criar Novo Orçamento (Simples)", description = "Cria um novo registro de orçamento apenas com dados de mão de obra.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Orçamento criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar criar o orçamento")
    })
    public ResponseEntity<OrcamentoResponseDto> createOrcamentoSimples(
            @Parameter(description = "Dados do orçamento para criação (apenas mão de obra)")
            @Valid @RequestBody OrcamentoRequestDto dto
    ) {
        log.info("Requisição POST /rest/orcamentos/simples");
        try {
            OrcamentoResponseDto orcamentoSalvo = orcamentoService.create(dto); // Chama o método create que recebe OrcamentoRequestDto
            URI location = ServletUriComponentsBuilder.fromCurrentRequestUri().path("/{id}") // Ajustado para pegar da request atual e adicionar /id
                    .buildAndExpand(orcamentoSalvo.getId()).toUri();
            return ResponseEntity.created(location).body(orcamentoSalvo);
        } catch (Exception e) {
            log.error("Erro ao criar orçamento (simples): {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao processar o cadastro do orçamento (simples).", e);
        }
    }


    @GetMapping
    @Operation(summary = "Listar Todos os Orçamentos (Simples)", description = "Retorna uma lista de todos os orçamentos cadastrados (sem detalhes de peças/serviço).")
    public ResponseEntity<List<OrcamentoResponseDto>> findAll() {
        log.info("Requisição para listar todos os orçamentos (simples)");
        List<OrcamentoResponseDto> orcamentos = orcamentoService.findAll();
        if (orcamentos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(orcamentos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Orçamento por ID (Simples)", description = "Retorna um orçamento específico pelo seu ID (sem detalhes de peças/serviço).")
    public ResponseEntity<OrcamentoResponseDto> findById(@PathVariable Long id) {
        log.info("Requisição para buscar orçamento (simples) por ID: {}", id);
        // O findById no serviço já lança OrcamentoNotFoundException, que é @ResponseStatus(NOT_FOUND)
        OrcamentoResponseDto orcamento = orcamentoService.findById(id);
        return ResponseEntity.ok(orcamento);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar Orçamento", description = "Remove um orçamento e suas associações diretas.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Orçamento deletado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Orçamento não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno ou falha de integridade de dados")
    })
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Requisição para deletar orçamento ID: {}", id);
        try {
            orcamentoService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (OrcamentoNotFoundException e) {
            log.warn("Orçamento não encontrado para deleção: ID {}", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) { // Pode ser DataIntegrityViolationException ou outra
            log.error("Erro ao deletar orçamento ID {}: {}", id, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao deletar orçamento. Verifique dependências.", e);
        }
    }
    // A linha 102 original provavelmente estava aqui, após o fechamento da classe,
    // ou dentro de um método que não foi fechado corretamente.
    // Garantindo que a classe seja fechada corretamente:
} // <<< ESTA É A CHAVE DE FECHAMENTO DA CLASSE OrcamentoController