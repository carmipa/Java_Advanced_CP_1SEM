// src/main/java/br/com/fiap/Controller/ClientesController.java
package br.com.fiap.controller;

import br.com.fiap.dto.cliente.ClienteInfoDTO;
import br.com.fiap.dto.cliente.ClienteRequestDto;
import br.com.fiap.dto.cliente.ClienteResponseDto;
import br.com.fiap.exception.ClientesNotFoundException;
import br.com.fiap.model.relacionamentos.ClienteId;
import br.com.fiap.service.clientes.ClienteService;
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
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RestController
@RequestMapping("/rest/clientes")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Clientes", description = "Gerenciamento de clientes e seus dados associados") // <<< TAG ADICIONADA
public class ClientesController {

    private static final Logger log = LoggerFactory.getLogger(ClientesController.class);
    @Autowired
    private ClienteService clienteService;

    // --- Endpoint de Busca de Clientes ---
    @GetMapping("/buscar")
    @Operation(summary = "Buscar Clientes por Critérios",
            description = "Retorna uma lista de clientes (com IDs e dados básicos) que correspondem aos critérios fornecidos (nome, documento ou ID Cliente). Pelo menos um critério deve ser informado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Busca realizada com sucesso, retornando lista de clientes"),
            @ApiResponse(responseCode = "204", description = "Nenhum cliente encontrado para os critérios fornecidos"),
            @ApiResponse(responseCode = "400", description = "Nenhum critério de busca válido foi fornecido"), // Revisado
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

    // --- Endpoints CRUD ---
    @GetMapping("/all")
    @Cacheable("clientes") // Considerar se o cache aqui é ideal, pois a lista pode mudar frequentemente
    @Operation(summary = "Listar Todos os Clientes", description = "Retorna uma lista completa de todos os clientes cadastrados.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de clientes retornada"),
            @ApiResponse(responseCode = "204", description = "Nenhum cliente cadastrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
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
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cliente encontrado"),
            @ApiResponse(responseCode = "400", description = "IDs fornecidos são inválidos ou incompletos"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado para os IDs fornecidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
    })
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
        } catch (IllegalArgumentException e) { // Captura validação do ID feita no service
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
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Cliente criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos para o cliente, endereço ou contato"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar criar o cliente")
    })
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
            // Poderia diferenciar erros de validação (400) de outros erros (500)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 (ou 400 dependendo do erro)
        }
    }

    @PutMapping("/{idCliente}/{idEndereco}")
    @CacheEvict(value = "clientes", allEntries = true)
    @Operation(summary = "Atualizar Cliente", description = "Atualiza um cliente existente (e seus dados de endereço/contato associados) pelo seu ID composto.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cliente atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos ou IDs na URL inválidos"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado para os IDs fornecidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno ao tentar atualizar o cliente")
    })
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
    @Operation(summary = "Deletar Cliente", description = "Deleta um cliente existente pelo seu ID composto. ATENÇÃO: Pode falhar se houver dependências (agendamentos, etc).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Cliente deletado com sucesso"),
            @ApiResponse(responseCode = "400", description = "IDs fornecidos são inválidos ou incompletos"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado para os IDs fornecidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno ou violação de integridade ao tentar deletar") // Ou 409
    })
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 (ou 409 Conflict)
        }
    }
}