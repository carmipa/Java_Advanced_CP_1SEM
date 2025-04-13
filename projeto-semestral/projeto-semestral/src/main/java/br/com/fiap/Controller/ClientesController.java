// --- src/main/java/br/com/fiap/Controller/ClientesController.java ---
package br.com.fiap.Controller;

import br.com.fiap.dto.cliente.ClienteRequestDto;
import br.com.fiap.dto.cliente.ClienteResponseDto;
import br.com.fiap.exception.ClientesNotFoundException;
import br.com.fiap.model.relacionamentos.ClienteId;
import br.com.fiap.service.clientes.ClienteService;
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
@RequestMapping("/rest/clientes")
@CrossOrigin(origins = "http://localhost:3000")
public class ClientesController {

    private static final Logger log = LoggerFactory.getLogger(ClientesController.class);

    @Autowired
    private ClienteService clienteService; // Injeta o Service

    @GetMapping("/all")
    @Cacheable("clientes")
    @Operation(summary = "Listar todos os clientes", description = "Retorna uma lista de todos os clientes cadastrados.")
    public ResponseEntity<List<ClienteResponseDto>> findAll() {
        log.info("Requisição para listar todos os clientes recebida");
        List<ClienteResponseDto> clientes = clienteService.findAll();
        if (clientes.isEmpty()) {
            log.info("Nenhum cliente encontrado.");
            return ResponseEntity.noContent().build();
        }
        log.info("Retornando {} clientes.", clientes.size());
        return ResponseEntity.ok(clientes);
    }

    // GET por ID composto (exemplo usando PathVariables)
    @GetMapping("/{idCliente}/{idEndereco}")
    @Operation(summary = "Buscar cliente por ID composto", description = "Retorna um cliente específico pelo seu ID_CLI e ID_ENDERECO.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cliente encontrado"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado")
    })
    public ResponseEntity<ClienteResponseDto> findById(@PathVariable Long idCliente, @PathVariable Long idEndereco) {
        ClienteId id = new ClienteId(idCliente, idEndereco);
        log.info("Requisição para buscar cliente por ID: {}", id);
        try {
            ClienteResponseDto cliente = clienteService.findById(id);
            log.info("Cliente encontrado: {}", id);
            return ResponseEntity.ok(cliente);
        } catch (ClientesNotFoundException e) {
            log.warn("Cliente não encontrado para o ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) { // Se o ID for inválido
            log.warn("ID Composto inválido fornecido: {}", id);
            return ResponseEntity.badRequest().build(); // 400 Bad Request
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar cliente por ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @CacheEvict(value = "clientes", allEntries = true)
    @Operation(summary = "Criar novo cliente", description = "Cria um novo registro de cliente, incluindo endereço e contato.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Cliente criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos")
    })
    public ResponseEntity<ClienteResponseDto> create(@RequestBody @Valid ClienteRequestDto clienteDto) {
        log.info("Requisição para criar novo cliente recebida: {}", clienteDto.getNome());
        try {
            // A lógica de salvar endereço/contato e chamar ViaCEP está no Service
            ClienteResponseDto savedCliente = clienteService.create(clienteDto);
            log.info("Cliente criado com sucesso com ID: {}", savedCliente.getIdCli()); // Usa idCli da resposta
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCliente);
        } catch (Exception e) {
            log.error("Erro ao criar cliente: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // Ou Bad Request se for erro de validação/negócio pego no service
        }
    }

    @PutMapping("/{idCliente}/{idEndereco}")
    @CacheEvict(value = "clientes", allEntries = true)
    @Operation(summary = "Atualizar cliente", description = "Atualiza um cliente existente pelo seu ID composto.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cliente atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos")
    })
    public ResponseEntity<ClienteResponseDto> update(@PathVariable Long idCliente, @PathVariable Long idEndereco, @RequestBody @Valid ClienteRequestDto clienteDto) {
        ClienteId id = new ClienteId(idCliente, idEndereco);
        log.info("Requisição para atualizar cliente ID: {}", id);
        try {
            // A lógica de atualizar endereço/contato está no Service
            ClienteResponseDto updatedCliente = clienteService.update(id, clienteDto);
            log.info("Cliente ID {} atualizado com sucesso.", id);
            return ResponseEntity.ok(updatedCliente);
        } catch (ClientesNotFoundException e) {
            log.warn("Cliente não encontrado para atualização, ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            log.warn("ID Composto inválido fornecido para atualização: {}", id);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar cliente ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{idCliente}/{idEndereco}")
    @CacheEvict(value = "clientes", allEntries = true)
    @Operation(summary = "Deletar cliente", description = "Deleta um cliente existente pelo seu ID composto.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Cliente deletado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado")
    })
    public ResponseEntity<Void> delete(@PathVariable Long idCliente, @PathVariable Long idEndereco) {
        ClienteId id = new ClienteId(idCliente, idEndereco);
        log.info("Requisição para deletar cliente ID: {}", id);
        try {
            // A lógica de lidar com dependências (ou cascade) está no Service/BD
            clienteService.deleteById(id);
            log.info("Cliente ID {} deletado com sucesso.", id);
            return ResponseEntity.noContent().build();
        } catch (ClientesNotFoundException e) {
            log.warn("Cliente não encontrado para exclusão, ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            log.warn("ID Composto inválido fornecido para exclusão: {}", id);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            // Ex: DataIntegrityViolationException
            log.error("Erro ao deletar cliente ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // Ou CONFLICT(409) dependendo do erro
        }
    }

    // Endpoints para gerenciar relacionamentos (Cliente <-> Veiculo, etc.) podem ser adicionados aqui
    // Ex: POST /rest/clientes/{idCliente}/{idEndereco}/veiculos/{veiculoId}
    //     DELETE /rest/clientes/{idCliente}/{idEndereco}/veiculos/{veiculoId}
    //     GET /rest/clientes/{idCliente}/{idEndereco}/veiculos
}