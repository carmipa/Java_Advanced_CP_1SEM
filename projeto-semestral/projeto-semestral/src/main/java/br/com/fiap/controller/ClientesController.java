// --- Arquivo: src/main/java/br/com/fiap/controller/ClientesController.java ---
package br.com.fiap.controller;

// --- Imports necessários para as operações restantes ---
import br.com.fiap.dto.cliente.ClienteInfoDTO;
import br.com.fiap.dto.cliente.ClienteRequestDto;
import br.com.fiap.dto.cliente.ClienteResponseDto;
import br.com.fiap.exception.ClientesNotFoundException;
import br.com.fiap.model.relacionamentos.ClienteId;
import br.com.fiap.service.clientes.ClienteService; // Apenas o ClienteService é necessário aqui
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
// Remover import do ClienteRelatorioCompletoDTO e RelatorioClienteService se existirem
import java.util.List;
// ------------------------------------------------------

@RestController
@RequestMapping("/rest/clientes") // Mapping base permanece o mesmo
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Clientes", description = "Gerenciamento de clientes e seus dados associados")
public class ClientesController {

    private static final Logger log = LoggerFactory.getLogger(ClientesController.class);

    @Autowired
    private ClienteService clienteService; // <<< Apenas ClienteService injetado

    // --- Endpoint de Busca de Clientes (Existente) ---
    @GetMapping("/buscar")
    @Operation(summary = "Buscar Clientes por Critérios",
            description = "Retorna uma lista de clientes (com IDs e dados básicos) que correspondem aos critérios fornecidos (nome, documento ou ID Cliente). Pelo menos um critério deve ser informado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Busca realizada com sucesso, retornando lista de clientes"),
            @ApiResponse(responseCode = "204", description = "Nenhum cliente encontrado para os critérios fornecidos"),
            @ApiResponse(responseCode = "400", description = "Nenhum critério de busca válido foi fornecido"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
    public ResponseEntity<List<ClienteInfoDTO>> buscar(
            @Parameter(description = "Parte do nome ou sobrenome do cliente (case-insensitive)") @RequestParam(required = false) String nome,
            @Parameter(description = "Número exato do documento (CPF/CNPJ)") @RequestParam(required = false) String documento,
            @Parameter(description = "ID exato do cliente (ID_CLI)") @RequestParam(required = false) Long idCliente
    ) {
        log.info("Requisição GET /rest/clientes/buscar: nome={}, documento={}, idCliente={}", nome, documento, idCliente);
        if ((nome == null || nome.isBlank()) && (documento == null || documento.isBlank()) && (idCliente == null || idCliente <= 0)) {
            log.warn("Busca de clientes chamada sem nenhum critério válido.");
            return ResponseEntity.badRequest().build(); // 400
        }
        try {
            List<ClienteInfoDTO> clientes = clienteService.buscarClientes(nome, documento, idCliente);
            if (clientes.isEmpty()) {
                log.info("Nenhum cliente encontrado para os critérios fornecidos.");
                return ResponseEntity.noContent().build(); // 204
            }
            log.info("Retornando {} clientes encontrados.", clientes.size());
            return ResponseEntity.ok(clientes); // 200
        } catch (Exception e) {
            log.error("Erro ao buscar clientes: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
        }
    }

    // --- Endpoints CRUD (Existentes) ---
    @GetMapping("/all")
    @Cacheable("clientes")
    @Operation(summary = "Listar Todos os Clientes", description = "Retorna uma lista completa de todos os clientes cadastrados.")
    @ApiResponses(value = { /* ... */ })
    public ResponseEntity<List<ClienteResponseDto>> findAll() {
        log.info("Requisição para listar todos os clientes recebida");
        List<ClienteResponseDto> clientes = clienteService.findAll();
        if (clientes.isEmpty()) {
            log.info("Nenhum cliente encontrado.");
            return ResponseEntity.noContent().build(); // 204
        }
        log.info("Retornando {} clientes.", clientes.size());
        return ResponseEntity.ok(clientes); // 200
    }

    @GetMapping("/{idCliente}/{idEndereco}")
    @Operation(summary = "Buscar Cliente por ID Composto", description = "Retorna um cliente específico pelo seu ID_CLI e ID_ENDERECO.")
    @ApiResponses(value = { /* ... */ })
    public ResponseEntity<ClienteResponseDto> findById(
            @Parameter(description = "ID numérico do cliente (parte da chave composta)") @PathVariable Long idCliente,
            @Parameter(description = "ID do endereço associado (parte da chave composta)") @PathVariable Long idEndereco
    ) {
        ClienteId id = new ClienteId(idCliente, idEndereco);
        log.info("Requisição para buscar cliente por ID: {}", id);
        try {
            ClienteResponseDto cliente = clienteService.findById(id);
            log.info("Cliente encontrado: {}", id);
            return ResponseEntity.ok(cliente); // 200
        } catch (ClientesNotFoundException e) {
            log.warn("Cliente não encontrado para o ID: {}", id);
            return ResponseEntity.notFound().build(); // 404
        } catch (IllegalArgumentException e) {
            log.warn("ID Composto inválido fornecido: {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build(); // 400
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar cliente por ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
        }
    }

    @PostMapping
    @CacheEvict(value = "clientes", allEntries = true)
    @Operation(summary = "Criar Novo Cliente", description = "Cria um novo registro de cliente, incluindo seu endereço e contato inicial.")
    @ApiResponses(value = { /* ... */ })
    public ResponseEntity<ClienteResponseDto> create(
            @Parameter(description = "Dados completos do cliente para criação") @RequestBody @Valid ClienteRequestDto clienteDto
    ) {
        log.info("Requisição para criar novo cliente recebida: {}", clienteDto.getNome());
        try {
            ClienteResponseDto savedCliente = clienteService.create(clienteDto);
            log.info("Cliente criado com sucesso com ID_CLI: {}", savedCliente.getIdCli());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCliente); // 201
        } catch (Exception e) {
            log.error("Erro ao criar cliente: {}", e.getMessage(), e);
            // Retorna uma resposta de erro mais informativa se possível
            //String message = "Erro interno ao criar cliente. Detalhes: " + e.getMessage();
            // Evita expor stack trace completo, mas dá uma pista
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null); // Ou retornar um objeto de erro { "error": message }
        }
    }


    @PutMapping("/{idCliente}/{idEndereco}")
    @CacheEvict(value = "clientes", allEntries = true)
    @Operation(summary = "Atualizar Cliente", description = "Atualiza um cliente existente (e seus dados de endereço/contato associados) pelo seu ID composto.")
    @ApiResponses(value = { /* ... */ })
    public ResponseEntity<ClienteResponseDto> update(
            @Parameter(description = "ID numérico do cliente a ser atualizado") @PathVariable Long idCliente,
            @Parameter(description = "ID do endereço associado ao cliente a ser atualizado") @PathVariable Long idEndereco,
            @Parameter(description = "Dados atualizados do cliente") @RequestBody @Valid ClienteRequestDto clienteDto
    ) {
        ClienteId id = new ClienteId(idCliente, idEndereco);
        log.info("Requisição para atualizar cliente ID: {}", id);
        try {
            ClienteResponseDto updatedCliente = clienteService.update(id, clienteDto);
            log.info("Cliente ID {} atualizado com sucesso.", id);
            return ResponseEntity.ok(updatedCliente); // 200
        } catch (ClientesNotFoundException e) {
            log.warn("Cliente não encontrado para atualização, ID: {}", id);
            return ResponseEntity.notFound().build(); // 404
        } catch (IllegalArgumentException e) {
            log.warn("ID Composto inválido fornecido para atualização: {}", id);
            return ResponseEntity.badRequest().build(); // 400
        } catch (Exception e) {
            log.error("Erro ao atualizar cliente ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
        }
    }

    @DeleteMapping("/{idCliente}/{idEndereco}")
    @CacheEvict(value = "clientes", allEntries = true)
    @Operation(summary = "Deletar Cliente", description = "Deleta um cliente existente pelo seu ID composto. ATENÇÃO: Pode falhar se houver dependências.")
    @ApiResponses(value = { /* ... */ })
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID numérico do cliente a ser deletado") @PathVariable Long idCliente,
            @Parameter(description = "ID do endereço associado ao cliente a ser deletado") @PathVariable Long idEndereco
    ) {
        ClienteId id = new ClienteId(idCliente, idEndereco);
        log.info("Requisição para deletar cliente ID: {}", id);
        try {
            clienteService.deleteById(id);
            log.info("Cliente ID {} deletado com sucesso.", id);
            return ResponseEntity.noContent().build(); // 204
        } catch (ClientesNotFoundException e) {
            log.warn("Cliente não encontrado para exclusão, ID: {}", id);
            return ResponseEntity.notFound().build(); // 404
        } catch (IllegalArgumentException e) {
            log.warn("ID Composto inválido fornecido para exclusão: {}", id);
            return ResponseEntity.badRequest().build(); // 400
        } catch (Exception e) { // Captura DataIntegrityViolationException ou outros
            log.error("Erro ao deletar cliente ID {}: {}", id, e.getMessage(), e);
            // Retorna 500, mas poderia retornar 409 (Conflict) se detectar DataIntegrityViolationException especificamente
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    // <<< O ENDPOINT /relatorio-completo FOI REMOVIDO DAQUI >>>

} // Fim da classe ClientesController